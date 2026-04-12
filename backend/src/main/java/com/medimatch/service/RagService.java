package com.medimatch.service;

import com.medimatch.dto.RagRequest;
import com.medimatch.dto.RagResponse;
import com.medimatch.dto.SearchRequest;
import com.medimatch.dto.SearchResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

/**
 * RAG Pipeline:
 * 1. RETRIEVE  — semantic search via Endee vector DB
 * 2. AUGMENT   — build a context-rich prompt from results
 * 3. GENERATE  — send to LLM (OpenAI GPT) for final answer
 */
@Service
public class RagService {

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String openAiModel;

    private final SearchService searchService;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RagService(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Full RAG pipeline execution.
     */
    public RagResponse generate(RagRequest request) {
        long start = System.currentTimeMillis();

        // ── STEP 1: RETRIEVE ──────────────────────────────────
        // Use Endee vector search to get relevant doctors + medicines
        SearchRequest searchRequest = new SearchRequest();
        searchRequest.setQuery(request.getQuery());
        searchRequest.setTopK(request.getTopK() > 0 ? request.getTopK() : 3);
        searchRequest.setSearchType("both");

        SearchResponse retrieved = searchService.search(searchRequest);

        // ── STEP 2: AUGMENT ───────────────────────────────────
        // Build a structured context string from retrieved results
        String context = buildContext(retrieved);

        // ── STEP 3: GENERATE ──────────────────────────────────
        // Send prompt + context to LLM
        String aiAnswer = callLLM(request.getQuery(), context);

        // ── Build Response ────────────────────────────────────
        RagResponse response = new RagResponse();
        response.setQuery(request.getQuery());
        response.setAiAnswer(aiAnswer);
        response.setRetrievedDoctors(retrieved.getDoctors());
        response.setRetrievedMedicines(retrieved.getMedicines());
        response.setContextUsed(context);
        response.setTotalTimeMs(System.currentTimeMillis() - start);
        return response;
    }

    /**
     * AUGMENT step — converts retrieved results into a readable context block.
     */
    private String buildContext(SearchResponse retrieved) {
        StringBuilder ctx = new StringBuilder();

        // Doctor context
        List<SearchResponse.DoctorResult> doctors = retrieved.getDoctors();
        if (doctors != null && !doctors.isEmpty()) {
            ctx.append("=== RELEVANT DOCTORS ===\n");
            for (SearchResponse.DoctorResult d : doctors) {
                ctx.append(String.format(
                    "- %s (%s) | Hospital: %s, %s | Experience: %d years | Rating: %.1f/5\n  Bio: %s\n",
                    d.getName(), d.getSpecialization(),
                    d.getHospital(), d.getCity(),
                    d.getExperienceYears() != null ? d.getExperienceYears() : 0,
                    d.getRating() != null ? d.getRating() : 0.0,
                    d.getBio() != null ? d.getBio() : ""
                ));
            }
        }

        // Medicine context
        List<SearchResponse.MedicineResult> medicines = retrieved.getMedicines();
        if (medicines != null && !medicines.isEmpty()) {
            ctx.append("\n=== RELEVANT MEDICINES ===\n");
            for (SearchResponse.MedicineResult m : medicines) {
                ctx.append(String.format(
                    "- %s (%s) | Category: %s | Dosage: %s | Rx: %s\n  Uses: %s\n  Side effects: %s\n",
                    m.getName(), m.getGenericName(),
                    m.getCategory(),
                    m.getDosage() != null ? m.getDosage() : "As directed",
                    Boolean.TRUE.equals(m.getRequiresPrescription()) ? "Required" : "OTC",
                    m.getUses() != null ? m.getUses() : "",
                    m.getSideEffects() != null ? m.getSideEffects() : "None reported"
                ));
            }
        }

        return ctx.toString();
    }

    /**
     * GENERATE step — sends context + query to OpenAI GPT.
     */
    private String callLLM(String userQuery, String context) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            // Fallback: rule-based answer if no API key configured
            return buildFallbackAnswer(userQuery, context);
        }

        try {
            String systemPrompt =
                "You are MediMatch AI, a helpful medical assistant. " +
                "Use ONLY the provided context (retrieved doctors and medicines) to answer. " +
                "Be concise, empathetic, and always remind the user to consult a doctor in person. " +
                "Do NOT invent doctors or medicines not in the context. " +
                "Format your response clearly with sections for Doctor Recommendation and Medicine Information.";

            String userPrompt = String.format(
                "Patient symptoms: %s\n\n" +
                "Context from our medical database:\n%s\n\n" +
                "Based on the above context, provide:\n" +
                "1. Which type of specialist the patient should see and why\n" +
                "2. The most relevant doctor from the list with contact info\n" +
                "3. Any relevant medicines (mention if prescription is needed)\n" +
                "4. General advice and disclaimer",
                userQuery, context
            );

            // Build OpenAI API request
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("model", openAiModel);
            payload.put("max_tokens", 600);
            payload.put("temperature", 0.4);

            ArrayNode messages = payload.putArray("messages");

            ObjectNode sysMsg = messages.addObject();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);

            ObjectNode userMsg = messages.addObject();
            userMsg.put("role", "user");
            userMsg.put("content", userPrompt);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openAiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

            HttpResponse<String> httpResponse = httpClient.send(
                httpRequest, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(httpResponse.body());
                return root.at("/choices/0/message/content").asText("No response generated.");
            } else {
                System.err.println("OpenAI error: " + httpResponse.statusCode());
                return buildFallbackAnswer(userQuery, context);
            }

        } catch (Exception e) {
            System.err.println("LLM call failed: " + e.getMessage());
            return buildFallbackAnswer(userQuery, context);
        }
    }

    /**
     * Fallback when no OpenAI key — generates answer from context directly.
     */
    private String buildFallbackAnswer(String query, String context) {
        if (context.isBlank()) {
            return "I could not find relevant doctors or medicines for your symptoms. " +
                   "Please consult a general physician near you.";
        }
        return "Based on your symptoms: \"" + query + "\"\n\n" +
               "Here is what our medical database suggests:\n\n" +
               context +
               "\n⚠️ Disclaimer: This is AI-generated information for reference only. " +
               "Always consult a qualified medical professional before taking any medication.";
    }
}