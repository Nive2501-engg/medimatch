package com.medimatch.controller;

import com.medimatch.dto.RagRequest;
import com.medimatch.dto.RagResponse;
import com.medimatch.service.RagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rag")
@CrossOrigin(origins = "*")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    /**
     * POST /api/rag/ask
     * Full RAG pipeline: Retrieve → Augment → Generate
     *
     * Request:  { "query": "I have chest pain", "topK": 3 }
     * Response: { "aiAnswer": "...", "retrievedDoctors": [...], ... }
     */
    @PostMapping("/ask")
    public ResponseEntity<RagResponse> ask(@RequestBody RagRequest request) {
        if (request.getQuery() == null || request.getQuery().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ragService.generate(request));
    }
}
