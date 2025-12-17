package org.example.marketplace.listings;

public record CreateListingRequest(
        String title,
        String description,
        String categoryCode,
        String unit,
        Double priceRon,
        Double lat,
        Double lon
) {}
