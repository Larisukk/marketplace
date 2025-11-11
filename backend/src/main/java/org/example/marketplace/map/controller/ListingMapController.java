package org.example.marketplace.map.controller;

import org.example.marketplace.map.dto.ListingMapDTO;
import org.example.marketplace.map.dto.ListingPointDTO;
import org.example.marketplace.map.service.ListingMapService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/listings")
public class ListingMapController {

    private final ListingMapService service;

    public ListingMapController(ListingMapService service) {
        this.service = service;
    }

    /** Rich list for map (array of DTOs). */
    @GetMapping("/map")
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
        return service.search(q, category, available, minLon, minLat, maxLon, maxLat, limit);
    }

    /** GeoJSON FeatureCollection for libs that prefer it. */
    @GetMapping("/map.geojson")
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
        return service.searchAsGeoJson(q, category, available, minLon, minLat, maxLon, maxLat, limit);
    }

    /** Fast bounding-box endpoint for map panning. */
    @GetMapping("/bbox")
    public List<ListingPointDTO> bbox(
            @RequestParam double minLon,
            @RequestParam double minLat,
            @RequestParam double maxLon,
            @RequestParam double maxLat,
            @RequestParam(required = false) Integer limit
    ) {
        return service.findInBbox(minLon, minLat, maxLon, maxLat, limit);
    }

    /** Fast radius endpoint for “near me”. */
    @GetMapping("/radius")
    public List<ListingPointDTO> radius(
            @RequestParam double lon,
            @RequestParam double lat,
            @RequestParam(defaultValue = "5000") int meters,
            @RequestParam(required = false) Integer limit
    ) {
        return service.findInRadius(lon, lat, meters, limit);
    }
}
