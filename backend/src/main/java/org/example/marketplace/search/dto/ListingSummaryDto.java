package org.example.marketplace.search.dto;

import java.util.UUID;

/**
 * Minimal details for a single listing used when clicking a list item.
 *
 * Purpose:
 *  - Provide just enough data to pan the map and open a popup (coords + title + price).
 *
 * How it connects:
 *  - Returned by ListingSearchController.summary(...) which delegates to
 *    ListingSearchRepository.findSummaryById(id).
 */
public record ListingSummaryDto(
        UUID id,
        String title,
        double lon,
        double lat,
        Integer priceCents,
        String currency
) {}