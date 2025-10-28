package org.example.marketplace.auth;

import org.example.marketplace.auth.dto.*;
import org.example.marketplace.user.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Map;

@Service
public class AuthService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwt;
    private final AuthSessionRepository sessions;

    public AuthService(UserRepository repo,
                       PasswordEncoder encoder,
                       AuthenticationManager authManager,
                       JwtService jwt,
                       AuthSessionRepository sessions) {
        this.repo = repo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwt = jwt;
        this.sessions = sessions;
    }

    private static String generateOpaqueToken() {
        byte[] bytes = new byte[64];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public void register(RegisterRequest r) {
        if (repo.existsByEmailIgnoreCase(r.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already used");
        }
        var user = UserEntity.builder()
                .email(r.email().trim())
                .displayName(r.displayName().trim())
                .passwordHash(encoder.encode(r.password()))
                .role(UserRole.USER)
                .isActive(true)
                .build();
        repo.save(user);
    }

    public LoginResponse login(LoginRequest r, String userAgent, String ip) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(r.email(), r.password()));
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        var user = repo.findByEmailIgnoreCase(r.email()).orElseThrow();

        var claims = Map.<String, Object>of(
                "email", user.getEmail(),
                "uid", user.getId(),
                "role", user.getRole().name()
        );

        String access = jwt.generateToken(claims, user.getEmail());

        String refreshRaw  = generateOpaqueToken();
        String refreshHash = sha256Base64(refreshRaw);

        InetAddress clientIp;
        try {
            clientIp = InetAddress.getByName(ip);
        } catch (UnknownHostException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid client IP");
        }

        var now = OffsetDateTime.now();
        var session = AuthSessionEntity.builder()
                .userId(user.getId())
                .refreshTokenHash(refreshHash)
                .userAgent(userAgent != null ? userAgent : "")
                .ipAddress(clientIp)
                .createdAt(now)
                .expiresAt(now.plusDays(30))
                .build();

        sessions.save(session);

        return new LoginResponse(access, jwt.getExpiresSeconds(), refreshRaw);
    }

    private static String sha256Base64(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash); // 44 chars
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
