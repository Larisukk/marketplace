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
            @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.jdbc = jdbc;
        this.users = users;

        // Absolute + normalized => consistent path regardless of working directory
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    private String mapUnit(String code) {
        if (code == null) throw new IllegalArgumentException("Unit is required");

        return switch (code) {
            case "kg" -> "KG";
            case "l" -> "L";
            case "buc" -> "BOX";
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

        String dbUnit = mapUnit(req.unit());

        jdbc.update(
                """
                INSERT INTO products (id, name, category_id)
                VALUES (?, ?, NULL)
                """,
                productId, req.title()
        );

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
                req.lat()
        );

        return listingId;
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
     * New version used by the controller: validates ownership by email (if provided).
     */
    @Transactional
    public void uploadListingImages(UUID listingId, List<MultipartFile> files, String email) throws IOException {
        if (files == null || files.isEmpty()) return;

        // Ensure listing exists + (optional) ownership check
        UUID ownerUserId;
        try {
            ownerUserId = jdbc.queryForObject(
                    "SELECT farmer_user_id FROM listings WHERE id = ?",
                    UUID.class,
                    listingId
            );
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
            if (file == null || file.isEmpty()) continue;

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
                    file.getSize()
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

    private static String sanitizeOriginalFilename(String original) {
        if (original == null) return "file";

        String name = original.trim();
        if (name.isEmpty()) return "file";

        // remove any path parts (Windows/mac/Linux)
        name = name.replace("\\", "/");
        int slash = name.lastIndexOf("/");
        if (slash >= 0) name = name.substring(slash + 1);

        // keep only safe chars
        name = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (name.isBlank()) return "file";

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
        if (dot > 0 && dot < name.length() - 1) return name;

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
