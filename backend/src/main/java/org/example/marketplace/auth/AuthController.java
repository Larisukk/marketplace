package org.example.marketplace.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.example.marketplace.auth.dto.*;
import org.example.marketplace.emailverification.EmailVerificationService;
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
    private final EmailVerificationService emailVerificationService;

    public AuthController(AuthService service, UserRepository repo, EmailVerificationService emailVerificationService) {
        this.service = service;
        this.repo = repo;
        this.emailVerificationService = emailVerificationService;
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

    @PatchMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid ChangePasswordRequest req
    ) {
        service.changePassword(
                principal.getUsername(),
                req.oldPassword(),
                req.newPassword()
        );

        return ResponseEntity.ok().build();
    }


    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        emailVerificationService.verify(token);
        return ResponseEntity.ok("Email verified successfully!");
    }

}
