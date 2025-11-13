package org.example.marketplace.map.dto;

public record ListingMapDTO(
        String id,
        String title,
        String productName,
        String categoryName,
        String farmerName,
        Double lat,
        Double lon,
        Integer priceCents,
        String currency,
        Double quantity,
        String unit,
        Boolean available,
        String addressText
) {}
