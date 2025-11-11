package org.example.marketplace.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;                 // atenție: javax.crypto.SecretKey
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final long expiresSeconds = 3600;

    private final SecretKey key;

    public JwtService() {
        String secret = System.getenv("APP_JWT_SECRET");
        if (secret == null || secret.length() < 32) {
            secret = "dev-secret-change-me-min-32-chars-1234567890";
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiresSeconds * 1000))
                .signWith(key, Jwts.SIG.HS256) // API jjwt 0.12.x
                .compact();
    }

    public boolean isValid(String token) {
        try {
            Claims c = claims(token);
            Date exp = c.getExpiration();
            return exp == null || exp.after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getEmail(String token) {
        Claims c = claims(token);
        String email = c.get("email", String.class);
        if (email == null) email = c.getSubject(); // fallback pe sub
        return email;
    }

    public String getRole(String token) {
        Claims c = claims(token);
        String role = c.get("role", String.class);
        return (role != null) ? role : "USER";
    }

    public long getExpiresSeconds() {
        return expiresSeconds;
    }

    private Claims claims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
