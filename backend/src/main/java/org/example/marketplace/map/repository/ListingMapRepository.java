package org.example.marketplace.map.repository;

import org.example.marketplace.map.dto.ListingMapDTO;
import org.example.marketplace.map.dto.ListingPointDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JDBC + PostGIS queries. Uses view v_listings_public + the listings.location GiST index.
 */
@Repository
public class ListingMapRepository {
    private final NamedParameterJdbcTemplate jdbc;

    public ListingMapRepository(JdbcTemplate jdbc) {
        this.jdbc = new NamedParameterJdbcTemplate(jdbc);
    }

    /** Text/category/availability with optional bbox; returns rich DTOs. */
    public List<ListingMapDTO> search(
            String q, String category, Boolean available,
            Double minLon, Double minLat, Double maxLon, Double maxLat,
            Integer limit
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT id::text, title, product_name, category_name, farmer_name,
                   lat, lon, price_cents, currency, quantity, unit::text AS unit,
                   available, address_text
            FROM v_listings_public
            WHERE 1=1
        """);

        MapSqlParameterSource p = new MapSqlParameterSource();

        if (q != null && !q.isBlank()) {
            sql.append("""
                AND (title ILIKE :q OR product_name ILIKE :q OR farmer_name ILIKE :q OR address_text ILIKE :q)
            """);
            p.addValue("q", "%" + q + "%");
        }
        if (category != null && !category.isBlank()) {
            sql.append(" AND category_name = :cat ");
            p.addValue("cat", category);
        }
        if (available != null) {
            sql.append(" AND available = :avail ");
            p.addValue("avail", available);
        }
        if (minLon != null && minLat != null && maxLon != null && maxLat != null) {
            sql.append("""
                AND id IN (
                  SELECT l.id
                  FROM listings l
                  WHERE ST_Intersects(
                    l.location::geometry,
                    ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
                  )
                )
            """);
            p.addValue("minLon", minLon);
            p.addValue("minLat", minLat);
            p.addValue("maxLon", maxLon);
            p.addValue("maxLat", maxLat);
        }

        sql.append(" ORDER BY created_at DESC ");
        sql.append(" LIMIT :lim ");
        p.addValue("lim", (limit == null || limit <= 0 || limit > 1000) ? 200 : limit);

        return jdbc.query(sql.toString(), p, (rs, i) -> new ListingMapDTO(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("product_name"),
                rs.getString("category_name"),
                rs.getString("farmer_name"),
                (Double) rs.getObject("lat"),
                (Double) rs.getObject("lon"),
                (Integer) rs.getObject("price_cents"),
                rs.getString("currency"),
                rs.getObject("quantity") == null ? null : ((Number) rs.getObject("quantity")).doubleValue(),
                rs.getString("unit"),
                (Boolean) rs.getObject("available"),
                rs.getString("address_text")
        ));
    }

    /** Fast bounding-box query using lon/lat from the view. */
    public List<ListingPointDTO> findInBbox(
            double minLon, double minLat, double maxLon, double maxLat, Integer limit
    ) {
        String sql = """
            SELECT id::text, title, product_name, price_cents, currency, lon, lat, farmer_name
            FROM v_listings_public
            WHERE lon BETWEEN :minLon AND :maxLon
              AND lat BETWEEN :minLat AND :maxLat
            ORDER BY created_at DESC
            LIMIT :lim
        """;

        var p = new MapSqlParameterSource()
                .addValue("minLon", minLon)
                .addValue("minLat", minLat)
                .addValue("maxLon", maxLon)
                .addValue("maxLat", maxLat)
                .addValue("lim", (limit == null || limit <= 0 || limit > 1000) ? 500 : limit);

        return jdbc.query(sql, p, (rs, i) -> new ListingPointDTO(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("product_name"),
                (Integer) rs.getObject("price_cents"),
                rs.getString("currency"),
                (Double) rs.getObject("lon"),
                (Double) rs.getObject("lat"),
                rs.getString("farmer_name")
        ));
    }

    /** Fast radius query using ST_DWithin on geography. */
    public List<ListingPointDTO> findInRadius(double lon, double lat, int meters, Integer limit) {
        String sql = """
            SELECT v.id::text, v.title, v.product_name, v.price_cents, v.currency, v.lon, v.lat, v.farmer_name
            FROM v_listings_public v
            WHERE v.id IN (
              SELECT l.id
              FROM listings l
              WHERE ST_DWithin(
                l.location,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                :meters
              )
            )
            ORDER BY v.created_at DESC
            LIMIT :lim
        """;

        var p = new MapSqlParameterSource()
                .addValue("lon", lon)
                .addValue("lat", lat)
                .addValue("meters", Math.max(1, meters))
                .addValue("lim", (limit == null || limit <= 0 || limit > 1000) ? 500 : limit);

        return jdbc.query(sql, p, (rs, i) -> new ListingPointDTO(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("product_name"),
                (Integer) rs.getObject("price_cents"),
                rs.getString("currency"),
                (Double) rs.getObject("lon"),
                (Double) rs.getObject("lat"),
                rs.getString("farmer_name")
        ));
    }
}
