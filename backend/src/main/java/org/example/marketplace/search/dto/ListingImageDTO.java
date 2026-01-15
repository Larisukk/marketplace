package org.example.marketplace.search.dto;

import java.util.UUID;


public record ListingImageDTO(
        UUID id,
        String url,
        int sortOrder
) {}
