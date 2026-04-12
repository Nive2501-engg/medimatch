package com.medimatch.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicines")
@Data
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "generic_name")
    private String genericName;

    private String category;
    private String manufacturer;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String uses;

    @Column(name = "side_effects", columnDefinition = "TEXT")
    private String sideEffects;

    private String dosage;

    @Column(name = "requires_prescription")
    private Boolean requiresPrescription = false;

    @Column(name = "price_inr")
    private BigDecimal priceInr;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
}
