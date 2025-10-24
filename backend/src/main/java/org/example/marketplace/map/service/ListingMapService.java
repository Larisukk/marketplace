package org.example.marketplace.map.service;

import org.example.marketplace.map.dto.ListingMapDTO;
import org.example.marketplace.map.dto.ListingPointDTO;
import org.example.marketplace.map.repository.ListingMapRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.util.Map.entry;

@Service
public class ListingMapService {
    private final ListingMapRepository repo;

    public ListingMapService(ListingMapRepository repo) {
        this.repo = repo;
    }

    public List<ListingMapDTO> search(String q, String category, Boolean available,
                                      Double minLon, Double minLat, Double maxLon, Double maxLat,
                                      Integer limit) {
        return repo.search(q, category, available, minLon, minLat, maxLon, maxLat, limit);
    }

    public Map<String, Object> searchAsGeoJson(String q, String category, Boolean available,
                                               Double minLon, Double minLat, Double maxLon, Double maxLat,
                                               Integer limit) {
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

    public List<ListingPointDTO> findInBbox(double minLon, double minLat, double maxLon, double maxLat, Integer limit) {
        return repo.findInBbox(minLon, minLat, maxLon, maxLat, limit);
    }

    public List<ListingPointDTO> findInRadius(double lon, double lat, int meters, Integer limit) {
        return repo.findInRadius(lon, lat, meters, limit);
    }
}
