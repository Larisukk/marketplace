package org.example.marketplace.search;

import org.example.marketplace.search.dto.ListingCardDto;
import org.example.marketplace.search.dto.ListingSummaryDto;
import org.example.marketplace.search.dto.PageDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/search")
public class ListingSearchController {

    private final ListingSearchRepository repo;

    public ListingSearchController(ListingSearchRepository repo) {
        this.repo = repo;
    }

    /**
     * GET /api/search/listings
     */
    @GetMapping("/listings")
    public ResponseEntity<PageDto<ListingCardDto>> search(
            @RequestParam(required = false) String bbox, // "w,s,e,n"
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer minPrice, // cents
            @RequestParam(required = false) Integer maxPrice, // cents
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "true") boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort) {
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

        // Validate sort
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        String sortDir = sortParts.length > 1 ? sortParts[1] : "desc";
        if (!List.of("price", "createdAt").contains(sortField))
            sortField = "createdAt";
        if (!List.of("asc", "desc").contains(sortDir))
            sortDir = "desc";

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
     * GET /api/search/listings/{id}
     */
    @GetMapping("/listings/{id}")
    public ResponseEntity<ListingCardDto> getById(@PathVariable UUID id) {
        return repo.findCardById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/search/listings/{id}/summary
     */
    @GetMapping("/listings/{id}/summary")
    public ResponseEntity<ListingSummaryDto> summary(@PathVariable UUID id) {
        return repo.findSummaryById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
