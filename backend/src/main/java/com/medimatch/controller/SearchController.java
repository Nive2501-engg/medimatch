package com.medimatch.controller;

import com.medimatch.dto.SearchRequest;
import com.medimatch.dto.SearchResponse;
import com.medimatch.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * POST /api/search
     * Body: { "query": "chest pain and shortness of breath", "topK": 5, "searchType": "both" }
     */
    @PostMapping("/search")
    public ResponseEntity<SearchResponse> search(@RequestBody SearchRequest request) {
        if (request.getQuery() == null || request.getQuery().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        SearchResponse response = searchService.search(request);
        return ResponseEntity.ok(response);
    }
}