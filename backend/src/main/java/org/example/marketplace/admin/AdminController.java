package org.example.marketplace.admin;

import org.example.marketplace.user.UserCommandService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
// @PreAuthorize("hasRole('ADMIN')") // Setup via SecurityConfig usually, but
// here fine
public class AdminController {

    private final UserCommandService users;

    public AdminController(UserCommandService users) {
        this.users = users;
    }

    @PostMapping("/users/{userId}/ban")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void banUser(@PathVariable UUID userId) {
        users.toggleActive(userId, false);
    }

    @PostMapping("/users/{userId}/unban")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unbanUser(@PathVariable UUID userId) {
        users.toggleActive(userId, true);
    }
}
