package org.example.marketplace.listings;

import org.example.marketplace.user.UserEntity;
import org.example.marketplace.user.UserRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class ListingCommandService {

    private final JdbcTemplate jdbc;
    private final UserRepository users;

    public ListingCommandService(JdbcTemplate jdbc, UserRepository users) {
        this.jdbc = jdbc;
        this.users = users;
    }

    private String mapUnit(String code) {
        if (code == null) {
            throw new IllegalArgumentException("Unit is required");
        }

        // Map frontend values → DB enum values from V2__demo_market_data.sql
        return switch (code) {
            case "kg"  -> "KG";
            case "l"   -> "L";
            case "buc" -> "BOX";   // or another enum value if you add one
            default -> throw new IllegalArgumentException("Unsupported unit: " + code);
        };
    }

    @Transactional
    public UUID createListing(CreateListingRequest req, String userEmail) {
        if (req.title() == null || req.title().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (req.priceRon() == null) {
            throw new IllegalArgumentException("Price is required");
        }
        if (req.lat() == null || req.lon() == null) {
            throw new IllegalArgumentException("Location (lat/lon) is required");
        }

        UserEntity user = users.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        int priceCents = (int) Math.round(req.priceRon() * 100);

        UUID productId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();

        // Map frontend unit ("kg", "l", "buc") → DB enum ("KG", "L", "BOX")
        String dbUnit = mapUnit(req.unit());

        // 1) insert product (category_id left NULL for now)
        jdbc.update(
                """
                INSERT INTO products (id, name, category_id)
                VALUES (?, ?, NULL)
                """,
                productId, req.title()
        );

        // 2) insert listing WITH location in the same statement
        jdbc.update(
                """
                INSERT INTO listings (
                    id, product_id, farmer_user_id,
                    title, description,
                    price_cents, currency,
                    quantity, unit,
                    available,
                    location
                )
                VALUES (?,?,?,?,?,?,?,?,CAST(? AS unit_type), TRUE,
                        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography)
                """,
                listingId,
                productId,
                user.getId(),
                req.title(),
                req.description(),
                priceCents,
                "RON",
                1.0d,
                dbUnit,
                req.lon(),   // x = lon
                req.lat()    // y = lat
        );

        return listingId;
    }

    @Transactional
    public void uploadListingImages(UUID listingId, List<MultipartFile> files, String userEmail) throws IOException {
        if (files == null || files.isEmpty()) {
            return;
        }

        // Get user ID
        UserEntity user = users.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        // Ensure listing exists and user owns it
        UUID ownerId;
        try {
            ownerId = jdbc.queryForObject(
                    "SELECT farmer_user_id FROM listings WHERE id = ?",
                    UUID.class,
                    listingId
            );
        } catch (EmptyResultDataAccessException ex) {
            throw new IllegalArgumentException("Listing not found: " + listingId);
        }

        if (!ownerId.equals(user.getId())) {
            throw new IllegalArgumentException("You do not have permission to upload images to this listing");
        }

        Path uploadRoot = Paths.get("uploads");
        Files.createDirectories(uploadRoot);

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            UUID mediaId = UUID.randomUUID();
            String fileName = mediaId + "-" + file.getOriginalFilename();
            Path target = uploadRoot.resolve(fileName);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String url = "/uploads/" + fileName;

            jdbc.update(
                    """
                    INSERT INTO media_assets (id, url, mime_type, created_at)
                    VALUES (?, ?, ?, now())
                    """,
                    mediaId,
                    url,
                    file.getContentType()
            );

            Integer nextSort = jdbc.queryForObject(
                    "SELECT COALESCE(MAX(sort_order) + 1, 0) FROM listing_images WHERE listing_id = ?",
                    Integer.class,
                    listingId
            );

            jdbc.update(
                    """
                    INSERT INTO listing_images (listing_id, media_asset_id, sort_order)
                    VALUES (?, ?, ?)
                    """,
                    listingId,
                    mediaId,
                    nextSort
            );
        }
    }
}
