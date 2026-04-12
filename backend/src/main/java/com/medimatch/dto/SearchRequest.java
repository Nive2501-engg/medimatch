package com.medimatch.dto;

import lombok.Data;

@Data
public class SearchRequest {
    private String query;           // "I have chest pain and shortness of breath"
    private int topK = 5;           // number of results
    private String searchType = "both"; // "doctors", "medicines", "both"
    private String specialization;  // optional filter
    private Boolean requiresPrescription; // optional medicine filter
}