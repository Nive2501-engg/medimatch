package com.medimatch.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// @Entity
// @Table(name = "doctors")
// @Data
// public class Doctor {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     private String name;
//     private String specialization;
//     private String hospital;
//     private String city;
//     private String phone;
//     private String email;

//     @Column(name = "experience_years")
//     private Integer experienceYears;

//     private BigDecimal rating;

//     @Column(columnDefinition = "TEXT")
//     private String bio;

//     @Column(name = "symptoms_treated", columnDefinition = "TEXT")
//     private String symptomsTreated;

//     @Column(name = "image_url")
//     private String imageUrl;

//     private Boolean available = true;

//     // @Column(name = "created_at")
//     // private LocalDateTime createdAt;
//     @Column(name = "created_at", insertable = false, updatable = false)
// private LocalDateTime createdAt;
// }
@Entity
@Table(name = "doctors")
@Data
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String specialization;
    private String hospital;
    private String city;
    private String phone;
    private String email;

    @Column(name = "experience_years")
    private Integer experienceYears;

    private BigDecimal rating;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "symptoms_treated", columnDefinition = "TEXT")
    private String symptomsTreated;

    @Column(name = "image_url")
    private String imageUrl;

    private Boolean available = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Doctor() {}
}