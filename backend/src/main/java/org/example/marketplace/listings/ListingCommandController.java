package org.example.marketplace.listings;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
public class ListingCommandController {

    private final ListingCommandService listings;

    public ListingCommandController(ListingCommandService listings) {
        this.listings = listings;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateListingResponse create(
            @RequestBody CreateListingRequest req,
            Authentication authentication) {
        String email = authentication.getName();
        UUID id = listings.createListing(req, email);
        return new CreateListingResponse(id);
    }

    @PutMapping("/{listingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(
            @PathVariable UUID listingId,
            @RequestBody UpdateListingRequest req,
            Authentication authentication) {
        String email = authentication.getName();
        listings.updateListing(listingId, req, email);
    }

    @DeleteMapping("/{listingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteListing(
            @PathVariable UUID listingId,
            Authentication authentication) {
        String email = authentication.getName();
        listings.deleteListing(listingId, email);
    }

    @PostMapping("/{listingId}/images")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void uploadImages(
            @PathVariable UUID listingId,
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication) throws IOException {
        String email = authentication.getName();
        listings.uploadListingImages(listingId, files, email);
    }

    @DeleteMapping("/{listingId}/images")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImage(
            @PathVariable UUID listingId,
            @RequestParam("url") String url,
            Authentication authentication) {
        String email = authentication.getName();
        listings.deleteListingImage(listingId, url, email);
    }
}
