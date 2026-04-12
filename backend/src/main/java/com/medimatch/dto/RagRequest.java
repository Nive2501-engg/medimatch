package com.medimatch.dto;

import lombok.Data;

@Data
public class RagRequest {
    private String query;    // patient's symptom description
    private int topK = 3;    // how many docs to retrieve from Endee
}
