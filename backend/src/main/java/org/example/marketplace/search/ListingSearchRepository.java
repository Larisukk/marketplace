package org.example.marketplace.search;

import org.example.marketplace.search.dto.ListingCardDto;
import org.example.marketplace.search.dto.ListingSummaryDto;

import java.util.*;

/**
 * Data-access abstraction for listing search.
 *
 * Purpose:
 *  - Defines WHAT queries we support (search page, count, single summary) without
 *    tying callers to a specific DB/SQL implementation.
 *
 * How it connects:
 *  - Implemented by ListingSearchRepositoryImpl (native SQL, Postgres + PostGIS).
 *  - Used by ListingSearchController to keep controllers free of SQL concerns.
 */
public interface ListingSearchRepository {

    /**
     * Returns a page of listing "cards" (list row + marker data) that match the filters.
     */
    List<ListingCardDto> search(String q, Integer minPrice, Integer maxPrice,
                                UUID productId, UUID categoryId, Boolean available,
                                Double w, Double s, Double e, Double n,
                                int limit, int offset, String sortField, String sortDir);

    /**
     * Returns total number of listings matching the same filters (for pagination).
     */
    long countSearch(String q, Integer minPrice, Integer maxPrice,
                     UUID productId, UUID categoryId, Boolean available,
                     Double w, Double s, Double e, Double n);

    /**
     * Returns a minimal summary for a listing (used to pan/open popup).
     */
    Optional<ListingSummaryDto> findSummaryById(UUID id);

    /**
     * Returns a full card/details view for a single listing (used by the details page).
     * Reuses {@link ListingCardDto} because it already contains description, thumbnail,
     * product/category and farmer display info.
     */
    Optional<ListingCardDto> findCardById(UUID id);
}