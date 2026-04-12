package com.medimatch.dto;

import lombok.Data;
import java.util.List;

@Data
public class RagResponse {
    private String query;
    private String aiAnswer;           // LLM generated answer
    private String contextUsed;        // what was fed to the LLM
    private List<SearchResponse.DoctorResult>   retrievedDoctors;
    private List<SearchResponse.MedicineResult> retrievedMedicines;
    private long totalTimeMs;
}
