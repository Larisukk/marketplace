package org.example.marketplace.map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.util.Map.entry; // for Map.ofEntries

@CrossOrigin(origins = "http://localhost:5173") // or a list of allowed origins
@RestController
public class ListingMapController {

    private final ListingMapRepository repo;

    public ListingMapController(ListingMapRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/api/listings/map")
    public List<ListingMapDTO> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Double minLon,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLon,
            @RequestParam(required = false) Double maxLat,
            @RequestParam(required = false) Integer limit
    ) {
        return repo.search(q, category, available, minLon, minLat, maxLon, maxLat, limit);
    }

    @GetMapping("/api/listings/map.geojson")
    public Map<String, Object> listGeoJson(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Double minLon,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLon,
            @RequestParam(required = false) Double maxLat,
            @RequestParam(required = false) Integer limit
    ) {
        var items = repo.search(q, category, available, minLon, minLat, maxLon, maxLat, limit);

        var features = items.stream().map(p -> {
            Map<String, Object> f = new HashMap<>();
            f.put("type", "Feature");
            f.put("geometry", Map.of(
                    "type", "Point",
                    "coordinates", List.of(p.lon(), p.lat()) // [lon, lat]
            ));

            var props = Map.ofEntries(
                    entry("id", p.id()),
                    entry("title", p.title()),
                    entry("product", p.productName()),
                    entry("category", p.categoryName()),
                    entry("farmer", p.farmerName()),
                    entry("priceCents", p.priceCents()),
                    entry("currency", p.currency()),
                    entry("quantity", p.quantity()),
                    entry("unit", p.unit()),
                    entry("available", p.available()),
                    entry("address", p.addressText())
            );

            f.put("properties", props);
            return f;
        }).toList();

        return Map.of("type", "FeatureCollection", "features", features);
    }
}
