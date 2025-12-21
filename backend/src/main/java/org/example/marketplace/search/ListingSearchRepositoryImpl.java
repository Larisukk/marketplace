package org.example.marketplace.search;

import org.example.marketplace.search.dto.ListingCardDto;
import org.example.marketplace.search.dto.ListingSummaryDto;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class ListingSearchRepositoryImpl implements ListingSearchRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public ListingSearchRepositoryImpl(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String BASE_FROM = """
    FROM public.listings l
    JOIN public.products p   ON p.id = l.product_id
    LEFT JOIN public.categories c ON c.id = p.category_id
    LEFT JOIN public.farmer_profiles fp ON fp.user_id = l.farmer_user_id
    LEFT JOIN LATERAL (
        SELECT ma.url AS thumbnail_url
        FROM public.listing_images li
        JOIN public.media_assets ma ON ma.id = li.media_asset_id
        WHERE li.listing_id = l.id
        ORDER BY li.sort_order ASC
        LIMIT 1
    ) thumb ON TRUE
    WHERE (:available::boolean IS NULL OR l.available = :available::boolean)
      AND (:minPrice::int     IS NULL OR l.price_cents >= :minPrice::int)
      AND (:maxPrice::int     IS NULL OR l.price_cents <= :maxPrice::int)
      AND (:productId::uuid   IS NULL OR l.product_id   = :productId::uuid)
      AND (:categoryId::uuid  IS NULL OR p.category_id  = :categoryId::uuid)
      AND (:q::text IS NULL OR (
            l.title       ILIKE '%' || :q || '%'
         OR l.description ILIKE '%' || :q || '%'
         OR p.name        ILIKE '%' || :q || '%'
      ))
      AND (:hasBbox::boolean = FALSE OR ST_Intersects(
            l.location,
            ST_MakeEnvelope(:w, :s, :e, :n, 4326)::geography
      ))
    """;

    @Override
    public List<ListingCardDto> search(String q, Integer minPrice, Integer maxPrice,
                                       UUID productId, UUID categoryId, Boolean available,
                                       Double w, Double s, Double e, Double n,
                                       int limit, int offset, String sortField, String sortDir) {

        String sortSql = switch (sortField) {
            case "price" -> "l.price_cents";
            default -> "l.created_at";
        } + ("asc".equalsIgnoreCase(sortDir) ? " ASC" : " DESC");

        String sql =
                """
                SELECT l.id, l.title,
                       ST_X(l.location::geometry) AS lon,
                       ST_Y(l.location::geometry) AS lat,
                       l.price_cents, l.currency,
                       p.name AS product_name,
                       c.name AS category_name,
                       thumb.thumbnail_url,
                       l.description,
                       fp.farm_name AS farmer_name
                """ + BASE_FROM +
                        " ORDER BY " + sortSql +
                        " LIMIT :limit OFFSET :offset";

        MapSqlParameterSource p = baseParams(q, minPrice, maxPrice, productId, categoryId, available, w, s, e, n)
                .addValue("limit", Math.max(1, limit))
                .addValue("offset", Math.max(0, offset));

        return jdbc.query(sql, p, (rs, i) -> {
            String thumb = rs.getString("thumbnail_url"); // expected "/uploads/...."
            if (thumb != null && thumb.isBlank()) thumb = null;

            return new ListingCardDto(
                    UUID.fromString(rs.getString("id")),
                    rs.getString("title"),
                    (Integer) rs.getObject("price_cents"),
                    rs.getString("currency"),
                    (Double) rs.getObject("lon"),
                    (Double) rs.getObject("lat"),
                    rs.getString("product_name"),
                    rs.getString("category_name"),
                    thumb,
                    rs.getString("description"),
                    rs.getString("farmer_name")
            );
        });
    }

    @Override
    public long countSearch(String q, Integer minPrice, Integer maxPrice,
                            UUID productId, UUID categoryId, Boolean available,
                            Double w, Double s, Double e, Double n) {
        String sql = "SELECT COUNT(*) " + BASE_FROM;
        MapSqlParameterSource p = baseParams(q, minPrice, maxPrice, productId, categoryId, available, w, s, e, n);
        return jdbc.queryForObject(sql, p, Long.class);
    }

    @Override
    public Optional<ListingSummaryDto> findSummaryById(UUID id) {
        String sql = """
            SELECT l.id, l.title,
                   ST_X(l.location::geometry) AS lon,
                   ST_Y(l.location::geometry) AS lat,
                   l.price_cents, l.currency
            FROM listings l
            WHERE l.id = :id
            """;
        MapSqlParameterSource p = new MapSqlParameterSource().addValue("id", id);

        var list = jdbc.query(sql, p, (rs, i) -> new ListingSummaryDto(
                UUID.fromString(rs.getString("id")),
                rs.getString("title"),
                rs.getDouble("lon"),
                rs.getDouble("lat"),
                (Integer) rs.getObject("price_cents"),
                rs.getString("currency")
        ));
        return list.stream().findFirst();
    }

    private MapSqlParameterSource baseParams(String q, Integer minPrice, Integer maxPrice,
                                             UUID productId, UUID categoryId, Boolean available,
                                             Double w, Double s, Double e, Double n) {
        boolean hasBbox = (w != null && s != null && e != null && n != null);
        return new MapSqlParameterSource()
                .addValue("q", (q == null || q.isBlank()) ? null : q)
                .addValue("minPrice", minPrice)
                .addValue("maxPrice", maxPrice)
                .addValue("productId", productId)
                .addValue("categoryId", categoryId)
                .addValue("available", available)
                .addValue("hasBbox", hasBbox)
                .addValue("w", w).addValue("s", s).addValue("e", e).addValue("n", n);
    }
}
