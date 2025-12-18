package org.example.marketplace.search;

import org.example.marketplace.search.dto.ListingCardDto;
import org.example.marketplace.search.dto.ListingSummaryDto;
import org.example.marketplace.search.dto.PageDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST layer (entry point for the frontend).
 *
 * Purpose:
 *  - Exposes the API endpoints used by the UI to search listings and fetch a single
 *    listing summary for map pan / popup.
 *
 * How it connects:
 *  - Depends on ListingSearchRepository (interface). The controller does NOT know SQL.
 *  - Calls:
 *      - repo.countSearch(...) to get the total number of results
 *      - repo.search(...) to fetch the current page of results as ListingCardDto
 *      - repo.findSummaryById(...) to get a ListingSummaryDto for a single id
 *  - Returns DTOs only (never entities) wrapped in PageDto when paginated.
 */
@RestController
@RequestMapping("/api/search")
public class ListingSearchController {

    private final ListingSearchRepository repo;

    public ListingSearchController(ListingSearchRepository repo) {
        this.repo = repo;
    }

    /**
     * GET /api/search/listings
     * Frontend passes filters in query params (q, minPrice, maxPrice, bbox, etc.).
     * We parse + validate them, then delegate to the repository.
     */
    @GetMapping("/search/listings")
    public ResponseEntity<PageDto<ListingCardDto>> search(
            @RequestParam(required = false) String bbox,          // "w,s,e,n" (lon/lat WGS84)
            @RequestParam(required = false) String q,             // free-text (title/descr/product)
            @RequestParam(required = false) Integer minPrice,     // cents
            @RequestParam(required = false) Integer maxPrice,     // cents
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "true") boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort
    ) {
        // Parse bbox -> (w,s,e,n)
        Double w = null, s = null, e = null, n = null;
        if (bbox != null && !bbox.isBlank()) {
            String[] parts = bbox.split(",");
            if (parts.length == 4) {
                w = Double.valueOf(parts[0]);
                s = Double.valueOf(parts[1]);
                e = Double.valueOf(parts[2]);
                n = Double.valueOf(parts[3]);
            }
        }

        // Validate sort (only allow whitelisted fields/directions)
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        String sortDir = sortParts.length > 1 ? sortParts[1] : "desc";
        if (!List.of("price", "createdAt").contains(sortField)) sortField = "createdAt";
        if (!List.of("asc", "desc").contains(sortDir)) sortDir = "desc";

        long total = repo.countSearch(q, minPrice, maxPrice, productId, categoryId, available, w, s, e, n);
        List<ListingCardDto> items = Collections.emptyList();
        if (total > 0) {
            int offset = Math.max(page, 0) * Math.max(size, 1);
            items = repo.search(q, minPrice, maxPrice, productId, categoryId, available,
                    w, s, e, n, size, offset, sortField, sortDir);
        }
        return ResponseEntity.ok(new PageDto<>(items, page, size, total));
    }

    /**
     * GET /api/listings/{id}/summary
     * Minimal data to pan/open a popup from the list click.
     */
    @GetMapping("/listings/{id}/summary")
    public ResponseEntity<ListingSummaryDto> summary(@PathVariable UUID id) {
        return repo.findSummaryById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/listings/{id}
     * Full card/details data for the listing details page.
     */
    @GetMapping("/listings/{id}")
    public ResponseEntity<ListingCardDto> details(@PathVariable UUID id) {
        return repo.findCardById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}