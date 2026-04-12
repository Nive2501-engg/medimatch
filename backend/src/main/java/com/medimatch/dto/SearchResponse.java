package com.medimatch.dto;

import com.medimatch.model.Doctor;
import com.medimatch.model.Medicine;
import lombok.Data;
import java.util.List;

@Data
public class SearchResponse {
    private String query;
    private List<DoctorResult> doctors;
    private List<MedicineResult> medicines;
    private long searchTimeMs;

    @Data
    public static class DoctorResult {
        private Long id;
        private String name;
        private String specialization;
        private String hospital;
        private String city;
        private String phone;
        private String email;
        private Integer experienceYears;
        private Double rating;
        private String bio;
        private Boolean available;
        private Double similarity;

        public static DoctorResult from(Doctor d, double similarity) {
            DoctorResult r = new DoctorResult();
            r.id = d.getId();
            r.name = d.getName();
            r.specialization = d.getSpecialization();
            r.hospital = d.getHospital();
            r.city = d.getCity();
            r.phone = d.getPhone();
            r.email = d.getEmail();
            r.experienceYears = d.getExperienceYears();
            r.rating = d.getRating() != null ? d.getRating().doubleValue() : 0.0;
            r.bio = d.getBio();
            r.available = d.getAvailable();
            r.similarity = Math.round(similarity * 1000.0) / 1000.0;
            return r;
        }
    }

    @Data
    public static class MedicineResult {
        private Long id;
        private String name;
        private String genericName;
        private String category;
        private String manufacturer;
        private String description;
        private String uses;
        private String sideEffects;
        private String dosage;
        private Boolean requiresPrescription;
        private Double priceInr;
        private Double similarity;

        public static MedicineResult from(Medicine m, double similarity) {
            MedicineResult r = new MedicineResult();
            r.id = m.getId();
            r.name = m.getName();
            r.genericName = m.getGenericName();
            r.category = m.getCategory();
            r.manufacturer = m.getManufacturer();
            r.description = m.getDescription();
            r.uses = m.getUses();
            r.sideEffects = m.getSideEffects();
            r.dosage = m.getDosage();
            r.requiresPrescription = m.getRequiresPrescription();
            r.priceInr = m.getPriceInr() != null ? m.getPriceInr().doubleValue() : 0.0;
            r.similarity = Math.round(similarity * 1000.0) / 1000.0;
            return r;
        }
    }
}
