package org.example.marketplace.search.dto;

import java.util.List;

/**
 * Generic pagination wrapper returned by the controller.
 *
 * Purpose:
 *  - Encapsulates the current slice of results (items) together with paging metadata.
 *
 * How it connects:
 *  - ListingSearchController returns PageDto<ListingCardDto> from /api/search/listings.
 *  - The frontend reads page/size/total to render the paginator and persists URL state.
 */
public record PageDto<T>(
        List<T> items,
        int page,
        int size,
        long total
) {}