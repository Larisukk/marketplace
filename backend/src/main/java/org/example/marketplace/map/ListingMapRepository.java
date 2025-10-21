package org.example.marketplace.map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ListingMapRepository {
    private final NamedParameterJdbcTemplate jdbc;

    public ListingMapRepository(JdbcTemplate jdbc) {
        this.jdbc = new NamedParameterJdbcTemplate(jdbc);
    }

    public List<ListingMapDTO> search(
            String q,                 // text search (title/product/farmer)
            String category,          // category name
            Boolean available,        // availability
            Double minLon, Double minLat, Double maxLon, Double maxLat, // bbox
            Integer limit
    ) {
        StringBuilder sql = new StringBuilder("""
      SELECT id::text, title, product_name, category_name, farmer_name,
             lat, lon, price_cents, currency, quantity, unit::text AS unit, available, address_text
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
        // BBOX filter using the base table with PostGIS (faster than filtering the view columns)
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
}
