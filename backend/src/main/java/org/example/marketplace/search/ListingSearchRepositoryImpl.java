package org.example.marketplace.search;

import org.example.marketplace.search.dto.ListingCardDto;
import org.example.marketplace.search.dto.ListingSummaryDto;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

/**
 * Concrete repository that runs optimized native SQL against
 * PostgreSQL/PostGIS.
 *
 * Purpose:
 * - Executes the actual queries with filters for text, price, availability,
 * product/category,
 * and spatial bbox (ST_Intersects on geography(Point,4326)).
 * - Maps rows into the DTOs used by the API layer (ListingCardDto /
 * ListingSummaryDto).
 *
 * How it connects:
 * - Implements ListingSearchRepository, so the controller can depend on the
 * interface.
 * - Uses NamedParameterJdbcTemplate for clean parameter binding and easy
 * testing.
 *
 * Notes on performance/indexes:
 * - Spatial filter: uses GiST index on listings.location (geography).
 * - Text filter: uses trigram GIN indexes on title/description/product name
 * (ILIKE + trigrams).
 * - Price/availability: standard B-tree indexes.
 */
@Repository
public class ListingSearchRepositoryImpl implements ListingSearchRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public ListingSearchRepositoryImpl(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Shared FROM/JOIN/WHERE clause. Each condition is guarded with a parameter so
    // the
    // planner can still use indexes when values are present and ignore when null.
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
                     p.name        ILIKE '%' || :q || '%'
                  OR l.title       ILIKE '%' || :q || '%'
                  OR l.description ILIKE '%' || :q || '%'
                  OR similarity(p.name, :q) > 0.15
                  OR similarity(l.title, :q) > 0.15
                  OR similarity(l.description, :q) > 0.15
              ))

              AND (:hasBbox::boolean = FALSE OR ST_Intersects(
                    l.location,
                    ST_MakeEnvelope(:w, :s, :e, :n, 4326)::geography
              ))
            """;

    @Override
    public List<ListingCardDto> search(String q, Integer minPrice, Integer maxPrice,
            UUID productId, UUID categoryId, Boolean available, // NOTE: Boolean (nullable)
            Double w, Double s, Double e, Double n,
            int limit, int offset, String sortField, String sortDir) {

        boolean hasQuery = (q != null && !q.isBlank());
        String sortSql;

        if (hasQuery) {
            sortSql = """
                    GREATEST(
                        similarity(p.name, :q),
                        similarity(l.title, :q),
                        similarity(l.description, :q)
                    ) DESC,
                    """ + ("price".equals(sortField)
                    ? "l.price_cents"
                    : "l.created_at") + ("asc".equalsIgnoreCase(sortDir) ? " ASC" : " DESC");
        } else {
            sortSql = switch (sortField) {
                case "price" -> "l.price_cents";
                default -> "l.created_at";
            } + ("asc".equalsIgnoreCase(sortDir) ? " ASC" : " DESC");
        }

        // >>> FIX: ensure spaces around ORDER BY and before LIMIT

        String sql = """
                SELECT l.id,
                       l.farmer_user_id,
                       l.title,
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
                .addValue("limit", limit)
                .addValue("offset", offset);

        return jdbc.query(sql, p, (rs, i) -> {
            String thumb = rs.getString("thumbnail_url");
            return new ListingCardDto(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("farmer_user_id")),
                    rs.getString("title"),
                    rs.getInt("price_cents"),
                    rs.getString("currency"),
                    rs.getDouble("lon"),
                    rs.getDouble("lat"),
                    rs.getString("product_name"),
                    rs.getString("category_name"),
                    rs.getString("thumbnail_url"),
                    rs.getString("description"),
                    rs.getString("farmer_name"),
                    Collections.emptyList());
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
                SELECT l.id,
                       l.farmer_user_id,
                       l.title,
                       ST_X(l.location::geometry) AS lon,
                       ST_Y(l.location::geometry) AS lat,
                       l.price_cents, l.currency
                FROM listings l
                WHERE l.id = :id
                """;

        MapSqlParameterSource p = new MapSqlParameterSource().addValue("id", id);
        var list = jdbc.query(sql, p, (rs, i) -> new ListingSummaryDto(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("farmer_user_id")),
                rs.getString("title"),
                rs.getDouble("lon"),
                rs.getDouble("lat"),
                rs.getInt("price_cents"),
                rs.getString("currency")));
        return list.stream().findFirst();
    }

    @Override
    public Optional<ListingCardDto> findCardById(UUID id) {
        String sql = """
                SELECT l.id,
                       l.farmer_user_id,
                       l.title,
                       ST_X(l.location::geometry) AS lon,
                       ST_Y(l.location::geometry) AS lat,
                       l.price_cents, l.currency,
                       p.name AS product_name,
                       c.name AS category_name,
                       thumb.thumbnail_url,
                       l.description,
                       l.description,
                       fp.farm_name AS farmer_name,
                       (
                           SELECT array_agg(ma.url ORDER BY li.sort_order)
                           FROM public.listing_images li
                           JOIN public.media_assets ma ON ma.id = li.media_asset_id
                           WHERE li.listing_id = l.id
                       ) AS images
                """ + BASE_FROM +
                """
                        AND l.id = :id
                        LIMIT 1
                        """;

        MapSqlParameterSource p = baseParams(null, null, null, null, null, null, null, null, null, null)
                .addValue("id", id);

        var list = jdbc.query(sql, p, (rs, i) -> {
            java.sql.Array arr = rs.getArray("images");
            List<String> images = (arr == null)
                    ? Collections.emptyList()
                    : Arrays.asList((String[]) arr.getArray());

            return new ListingCardDto(
                    UUID.fromString(rs.getString("id")),
                    UUID.fromString(rs.getString("farmer_user_id")),
                    rs.getString("title"),
                    rs.getInt("price_cents"),
                    rs.getString("currency"),
                    rs.getDouble("lon"),
                    rs.getDouble("lat"),
                    rs.getString("product_name"),
                    rs.getString("category_name"),
                    rs.getString("thumbnail_url"),
                    rs.getString("description"),
                    rs.getString("farmer_name"),
                    images);
        });

        return list.stream().findFirst();

    }

    // Helper to bind all optional filters safely.
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
