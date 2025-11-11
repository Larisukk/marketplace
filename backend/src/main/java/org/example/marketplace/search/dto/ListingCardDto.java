package org.example.marketplace.search.dto;

import java.util.UUID;

/**
 * Lightweight list-row + map-marker DTO.
 *
 * Purpose:
 *  - Minimal fields needed to render the side list and the markers on the map.
 *
 * How it connects:
 *  - Created by ListingSearchRepositoryImpl.search(...) and returned inside PageDto.
 *  - Used directly by the frontend to render cards + highlight markers.
 */
public record ListingCardDto(
        UUID id,
        String title,
        Integer priceCents,
        String currency,
        double lon,
        double lat,
        String productName,
        String categoryName,
        String thumbnailUrl
) {}