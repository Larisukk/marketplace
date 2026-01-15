package org.example.marketplace.listings;

import org.example.marketplace.user.UserEntity;
import org.example.marketplace.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ListingCommandService {

    private final JdbcTemplate jdbc;
    private final UserRepository users;

    // One single upload dir, configurable via app.upload.dir
    private final Path uploadRoot;

    public ListingCommandService(
            JdbcTemplate jdbc,
            UserRepository users,
            @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.jdbc = jdbc;
        this.users = users;

        // Absolute + normalized => consistent path regardless of working directory
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    private String mapUnit(String code) {
        if (code == null)
            throw new IllegalArgumentException("Unit is required");

        return switch (code) {
            case "kg" -> "KG";
            case "l" -> "L";
            case "buc" -> "BOX";
            default -> throw new IllegalArgumentException("Unsupported unit: " + code);
        };
    }

    private UUID resolveCategoryId(String code) {
        if (code == null || code.isBlank())
            return null;

        String dbName = switch (code.toLowerCase()) {
            case "fructe" -> "Fruits";
            case "legume" -> "Vegetables";
            case "lactate", "oua" -> "Dairy";
            case "carne" -> "Meat";
            default -> null; // 'altele' or unknown
        };

        if (dbName == null)
            return null;

        try {
            return jdbc.queryForObject("SELECT id FROM categories WHERE name = ?", UUID.class, dbName);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
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

        String dbUnit = mapUnit(req.unit());
        UUID categoryId = resolveCategoryId(req.categoryCode());

        jdbc.update(
                """
                        INSERT INTO products (id, name, category_id)
                        VALUES (?, ?, ?)
                        """,
                productId, req.title(), categoryId);

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
                req.lon(),
                req.lat());

        return listingId;
    }

    @Transactional
    public void updateListing(UUID listingId, UpdateListingRequest req, String userEmail) {
        UserEntity user = users.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        // Check ownership
        UUID ownerId = jdbc.queryForObject("SELECT farmer_user_id FROM listings WHERE id = ?", UUID.class, listingId);
        if (!user.getId().equals(ownerId)) {
            throw new IllegalArgumentException("Not allowed to edit this listing");
        }

        // Update basic fields
        if (req.title() != null && !req.title().isBlank()) {
            jdbc.update("UPDATE listings SET title = ? WHERE id = ?", req.title(), listingId);
            jdbc.update("UPDATE products SET name = ? WHERE id = (SELECT product_id FROM listings WHERE id = ?)",
                    req.title(), listingId);
        }
        // Update Category if provided
        if (req.categoryCode() != null) {
            UUID catId = resolveCategoryId(req.categoryCode());
            jdbc.update("UPDATE products SET category_id = ? WHERE id = (SELECT product_id FROM listings WHERE id = ?)",
                    catId, listingId);
        }

        if (req.description() != null) {
            jdbc.update("UPDATE listings SET description = ? WHERE id = ?", req.description(), listingId);
        }
        if (req.priceRon() != null) {
            int priceCents = (int) Math.round(req.priceRon() * 100);
            jdbc.update("UPDATE listings SET price_cents = ? WHERE id = ?", priceCents, listingId);
        }
        if (req.unit() != null) {
            String dbUnit = mapUnit(req.unit());
            jdbc.update("UPDATE listings SET unit = CAST(? AS unit_type) WHERE id = ?", dbUnit, listingId);
        }
        if (req.available() != null) {
            jdbc.update("UPDATE listings SET available = ? WHERE id = ?", req.available(), listingId);
        }
        if (req.lat() != null && req.lon() != null) {
            jdbc.update("UPDATE listings SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?",
                    req.lon(), req.lat(), listingId);
        }
    }

    @Transactional
    public void deleteListing(UUID listingId, String userEmail) {
        // Ownership check
        UserEntity user = users.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UUID ownerId = jdbc.queryForObject("SELECT farmer_user_id FROM listings WHERE id = ?", UUID.class, listingId);

        boolean isAdmin = user.getRole().name().equals("ADMIN");
        if (!user.getId().equals(ownerId) && !isAdmin) {
            throw new IllegalArgumentException("Not allowed to delete this listing");
        }

        // Deletion cascading is handled by DB FKs usually, but let's be explicit if
        // needed
        // Assuming ON DELETE CASCADE in SQL for listing_images, etc.
        jdbc.update("DELETE FROM listings WHERE id = ?", listingId);
    }

    @Transactional
    public void deleteListingImage(UUID listingId, String imageUrl, String userEmail) {
        // Ownership check
        UserEntity user = users.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        UUID ownerId = jdbc.queryForObject("SELECT farmer_user_id FROM listings WHERE id = ?", UUID.class, listingId);

        boolean isAdmin = user.getRole().name().equals("ADMIN");
        if (!user.getId().equals(ownerId) && !isAdmin) {
            throw new IllegalArgumentException("Not allowed");
        }

        // Find media asset id from URL (simple check)
        String sql = """
                    SELECT li.media_asset_id
                    FROM listing_images li
                    JOIN media_assets ma ON ma.id = li.media_asset_id
                    WHERE li.listing_id = ? AND ma.url = ?
                """;

        List<UUID> mediaIds = jdbc.query(sql, (rs, i) -> UUID.fromString(rs.getString("media_asset_id")), listingId,
                imageUrl);

        for (UUID mid : mediaIds) {
            jdbc.update("DELETE FROM listing_images WHERE listing_id = ? AND media_asset_id = ?", listingId, mid);
            // Optionally delete from media_assets and disk, but simple unlink is enough for
            // now
        }
    }

    /**
     * BACKWARD-COMPAT overload (older callers might still call 2-args version).
     * If you still have any code calling uploadListingImages(listingId, files),
     * it will continue to compile.
     */
    @Transactional
    public void uploadListingImages(UUID listingId, List<MultipartFile> files) throws IOException {
        uploadListingImages(listingId, files, null);
    }

    /**
     * New version used by the controller: validates ownership by email (if
     * provided).
     */
    @Transactional
    public void uploadListingImages(UUID listingId, List<MultipartFile> files, String email) throws IOException {
        if (files == null || files.isEmpty())
            return;

        // Ensure listing exists + (optional) ownership check
        UUID ownerUserId;
        try {
            ownerUserId = jdbc.queryForObject(
                    "SELECT farmer_user_id FROM listings WHERE id = ?",
                    UUID.class,
                    listingId);
        } catch (EmptyResultDataAccessException ex) {
            throw new IllegalArgumentException("Listing not found: " + listingId);
        }

        // If email is provided, ensure authenticated user owns this listing
        if (email != null && !email.isBlank()) {
            UserEntity user = users.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

            if (!user.getId().equals(ownerUserId)) {
                throw new IllegalArgumentException("Not allowed to upload images for this listing");
            }
        }

        Files.createDirectories(uploadRoot);

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty())
                continue;

            // allow only images
            String contentType = file.getContentType();
            if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed");
            }

            UUID mediaId = UUID.randomUUID();

            String safeOriginal = sanitizeOriginalFilename(file.getOriginalFilename());

            // Ensure filename has extension (helps browser display)
            safeOriginal = ensureExtension(safeOriginal, contentType);

            String fileName = mediaId + "-" + safeOriginal;

            // Always inside uploadRoot
            Path target = uploadRoot.resolve(fileName).normalize();
            if (!target.startsWith(uploadRoot)) {
                throw new IllegalArgumentException("Invalid file path");
            }

            // Save file
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            // URL that frontend uses (served via WebConfig)
            String url = "/uploads/" + fileName;

            jdbc.update(
                    """
                            INSERT INTO media_assets (id, url, storage_path, mime_type, size_bytes, created_at)
                            VALUES (?, ?, ?, ?, ?, now())
                            """,
                    mediaId,
                    url,
                    target.toString(),
                    contentType,
                    file.getSize());

            Integer nextSort = jdbc.queryForObject(
                    "SELECT COALESCE(MAX(sort_order) + 1, 0) FROM listing_images WHERE listing_id = ?",
                    Integer.class,
                    listingId);

            jdbc.update(
                    """
                            INSERT INTO listing_images (listing_id, media_asset_id, sort_order)
                            VALUES (?, ?, ?)
                            """,
                    listingId,
                    mediaId,
                    nextSort);
        }
    }

    private static String sanitizeOriginalFilename(String original) {
        if (original == null)
            return "file";

        String name = original.trim();
        if (name.isEmpty())
            return "file";

        // remove any path parts (Windows/mac/Linux)
        name = name.replace("\\", "/");
        int slash = name.lastIndexOf("/");
        if (slash >= 0)
            name = name.substring(slash + 1);

        // keep only safe chars
        name = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (name.isBlank())
            return "file";

        // optional: limit length
        if (name.length() > 120) {
            String ext = "";
            int dot = name.lastIndexOf('.');
            if (dot > 0 && dot < name.length() - 1) {
                ext = name.substring(dot);
                name = name.substring(0, dot);
            }
            name = name.substring(0, Math.min(120, name.length())) + ext;
        }

        return name;
    }

    private static String ensureExtension(String name, String contentType) {
        // already has extension
        int dot = name.lastIndexOf('.');
        if (dot > 0 && dot < name.length() - 1)
            return name;

        String ext = switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/jpg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".img";
        };

        return name + ext;
    }
}
