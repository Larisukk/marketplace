package org.example.marketplace.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.example.marketplace.auth.dto.*;
import org.example.marketplace.user.UserEntity;
import org.example.marketplace.user.UserRepository;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;
    private final UserRepository repo;

    public AuthController(AuthService service, UserRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid RegisterRequest req) {
        service.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest req, HttpServletRequest http) {
        String ua = http.getHeader("User-Agent");
        String xff = http.getHeader("X-Forwarded-For");
        String ip = (xff != null && !xff.isBlank())
                ? xff.split(",")[0].trim()
                : http.getRemoteAddr();
        return service.login(req, ua, ip);
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal UserDetails principal) {
        var u = repo.findByEmailIgnoreCase(principal.getUsername()).orElseThrow();
        return new MeResponse(u.getId(), u.getEmail(), u.getDisplayName(), u.getRole().name());
    }
}
