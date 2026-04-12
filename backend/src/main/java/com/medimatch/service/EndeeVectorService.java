package com.medimatch.service;

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
import java.util.*;

/**
 * Client for Endee Vector Database REST API.
 * Handles index management, upsert, and similarity search.
 */
@Service
public class EndeeVectorService {

    @Value("${endee.base-url}")
    private String baseUrl;

    @Value("${endee.auth-token:}")
    private String authToken;

    @Value("${endee.doctors-index}")
    private String doctorsIndex;

    @Value("${endee.medicines-index}")
    private String medicinesIndex;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Index Management ────────────────────────────────────────

    public void createIndexIfNotExists(String indexName, int dimension) {
        try {
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("name", indexName);
            payload.put("dimension", dimension);
            payload.put("space_type", "cosine");
            payload.put("precision", "INT8");

            post("/index/create", payload.toString());
        } catch (Exception e) {
            System.err.println("Index creation note: " + e.getMessage());
        }
    }

    // ── Vector Upsert ───────────────────────────────────────────

    public void upsertDoctorVector(String id, float[] vector, Map<String, Object> meta,
                                   Map<String, Object> filter) {
        upsertVector(doctorsIndex, id, vector, meta, filter);
    }

    public void upsertMedicineVector(String id, float[] vector, Map<String, Object> meta,
                                     Map<String, Object> filter) {
        upsertVector(medicinesIndex, id, vector, meta, filter);
    }

    private void upsertVector(String indexName, String id, float[] vector,
                              Map<String, Object> meta, Map<String, Object> filter) {
        try {
            ObjectNode item = objectMapper.createObjectNode();
            item.put("id", id);

            ArrayNode vecNode = item.putArray("vector");
            for (float v : vector) vecNode.add(v);

            if (meta != null) item.set("meta", objectMapper.valueToTree(meta));
            if (filter != null) item.set("filter", objectMapper.valueToTree(filter));

            ObjectNode payload = objectMapper.createObjectNode();
            payload.set("vectors", objectMapper.createArrayNode().add(item));

            post("/index/" + indexName + "/upsert", payload.toString());
        } catch (Exception e) {
            System.err.println("Upsert error for " + id + ": " + e.getMessage());
        }
    }

    // ── Similarity Search ───────────────────────────────────────

    /**
     * Search the doctors index and return a map of { "doc_N" -> similarity }
     */
    public Map<String, Double> searchDoctors(float[] queryVector, int topK) {
        return searchIndex(doctorsIndex, queryVector, topK, null);
    }

    /**
     * Search the medicines index and return a map of { "med_N" -> similarity }
     */
    public Map<String, Double> searchMedicines(float[] queryVector, int topK) {
        return searchIndex(medicinesIndex, queryVector, topK, null);
    }

    public Map<String, Double> searchDoctorsFiltered(float[] queryVector, int topK,
                                                      String specialization) {
        List<Map<String, Object>> filters = null;
        if (specialization != null && !specialization.isBlank()) {
            filters = List.of(Map.of("specialization", Map.of("$eq", specialization)));
        }
        return searchIndex(doctorsIndex, queryVector, topK, filters);
    }

    public Map<String, Double> searchMedicinesFiltered(float[] queryVector, int topK,
                                                        Boolean requiresPrescription) {
        List<Map<String, Object>> filters = null;
        if (requiresPrescription != null) {
            filters = List.of(Map.of("requires_prescription",
                    Map.of("$eq", requiresPrescription ? 1 : 0)));
        }
        return searchIndex(medicinesIndex, queryVector, topK, filters);
    }

    private Map<String, Double> searchIndex(String indexName, float[] queryVector,
                                             int topK, List<Map<String, Object>> filters) {
        Map<String, Double> results = new LinkedHashMap<>();
        try {
            ObjectNode payload = objectMapper.createObjectNode();

            ArrayNode vecNode = payload.putArray("vector");
            for (float v : queryVector) vecNode.add(v);

            payload.put("top_k", topK);
            payload.put("ef", 128);
            payload.put("include_vectors", false);

            if (filters != null && !filters.isEmpty()) {
                payload.set("filter", objectMapper.valueToTree(filters));
            }

            String responseBody = post("/index/" + indexName + "/query", payload.toString());
            if (responseBody == null) return results;

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode items = root.isArray() ? root : root.get("results");
            if (items == null || !items.isArray()) return results;

            for (JsonNode item : items) {
                String id = item.has("id") ? item.get("id").asText() : null;
                double similarity = item.has("similarity") ? item.get("similarity").asDouble() : 0.0;
                if (id != null) results.put(id, similarity);
            }
        } catch (Exception e) {
            System.err.println("Search error on '" + indexName + "': " + e.getMessage());
        }
        return results;
    }

    // ── HTTP Helper ─────────────────────────────────────────────

    private String post(String path, String body) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body));

            if (authToken != null && !authToken.isBlank()) {
                builder.header("Authorization", authToken);
            }

            HttpResponse<String> response = httpClient.send(builder.build(),
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                System.err.println("Endee error " + response.statusCode()
                        + " on " + path + ": " + response.body().substring(0, Math.min(200, response.body().length())));
            }
            return response.body();
        } catch (Exception e) {
            System.err.println("HTTP error on " + path + ": " + e.getMessage());
            return null;
        }
    }
}
