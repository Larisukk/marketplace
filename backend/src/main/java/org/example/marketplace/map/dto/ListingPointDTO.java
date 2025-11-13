package org.example.marketplace.map.dto;

/** Minimal payload for fast endpoints (bbox / radius). */
public record ListingPointDTO(
        String id,
        String title,
        String productName,
        Integer priceCents,
        String currency,
        Double lon,
        Double lat,
        String farmerName
) {}
