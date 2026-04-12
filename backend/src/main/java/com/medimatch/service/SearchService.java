package com.medimatch.service;

import com.medimatch.dto.SearchRequest;
import com.medimatch.dto.SearchResponse;
import com.medimatch.model.Doctor;
import com.medimatch.model.Medicine;
import com.medimatch.repository.DoctorRepository;
import com.medimatch.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final EmbeddingService embeddingService;
    private final EndeeVectorService endeeVectorService;
    private final DoctorRepository doctorRepository;
    private final MedicineRepository medicineRepository;

    public SearchService(EmbeddingService embeddingService,
                         EndeeVectorService endeeVectorService,
                         DoctorRepository doctorRepository,
                         MedicineRepository medicineRepository) {
        this.embeddingService = embeddingService;
        this.endeeVectorService = endeeVectorService;
        this.doctorRepository = doctorRepository;
        this.medicineRepository = medicineRepository;
    }

    public SearchResponse search(SearchRequest request) {
    long start = System.currentTimeMillis();

    String query = request.getQuery().toLowerCase();
    String type = request.getSearchType() != null ? request.getSearchType() : "both";

    SearchResponse response = new SearchResponse();
    response.setQuery(request.getQuery());

    // 🔹 Doctors search (simple filter)
    if ("both".equals(type) || "doctors".equals(type)) {
        List<SearchResponse.DoctorResult> doctorResults = doctorRepository.findAll()
                .stream()
                .filter(d ->
                        (d.getSymptomsTreated() != null && d.getSymptomsTreated().toLowerCase().contains(query)) ||
                        (d.getSpecialization() != null && d.getSpecialization().toLowerCase().contains(query))
                )
                .map(d -> SearchResponse.DoctorResult.from(d, 1.0))
                .toList();

        response.setDoctors(doctorResults);
    } else {
        response.setDoctors(Collections.emptyList());
    }

    // 🔹 Medicines search (simple filter)
    if ("both".equals(type) || "medicines".equals(type)) {
        List<SearchResponse.MedicineResult> medicineResults = medicineRepository.findAll()
                .stream()
                .filter(m ->
                        (m.getUses() != null && m.getUses().toLowerCase().contains(query)) ||
                        (m.getName() != null && m.getName().toLowerCase().contains(query))
                )
                .map(m -> SearchResponse.MedicineResult.from(m, 1.0))
                .toList();

        response.setMedicines(medicineResults);
    } else {
        response.setMedicines(Collections.emptyList());
    }

    response.setSearchTimeMs(System.currentTimeMillis() - start);
    return response;
}

    private List<SearchResponse.DoctorResult> resolveDoctors(Map<String, Double> scores) {
        List<SearchResponse.DoctorResult> results = new ArrayList<>();
        for (Map.Entry<String, Double> entry : scores.entrySet()) {
            String id = entry.getKey().replace("doc_", "");
            try {
                Long dbId = Long.parseLong(id);
                doctorRepository.findById(dbId).ifPresent(doctor ->
                        results.add(SearchResponse.DoctorResult.from(doctor, entry.getValue())));
            } catch (NumberFormatException ignored) {}
        }
        // Sort by similarity descending
        results.sort((a, b) -> Double.compare(b.getSimilarity(), a.getSimilarity()));
        return results;
    }

    private List<SearchResponse.MedicineResult> resolveMedicines(Map<String, Double> scores) {
        List<SearchResponse.MedicineResult> results = new ArrayList<>();
        for (Map.Entry<String, Double> entry : scores.entrySet()) {
            String id = entry.getKey().replace("med_", "");
            try {
                Long dbId = Long.parseLong(id);
                medicineRepository.findById(dbId).ifPresent(medicine ->
                        results.add(SearchResponse.MedicineResult.from(medicine, entry.getValue())));
            } catch (NumberFormatException ignored) {}
        }
        results.sort((a, b) -> Double.compare(b.getSimilarity(), a.getSimilarity()));
        return results;
    }
}