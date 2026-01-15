package org.example.marketplace.listings;

import java.util.UUID;

public record UpdateListingRequest(
        String title,
        String description,
        String categoryCode,
        String unit,
        Double priceRon,
        Double lat,
        Double lon,
        Boolean available) {
}
