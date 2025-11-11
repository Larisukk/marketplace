package org.example.marketplace.auth.dto;

public record AuthResponse(String accessToken, long expiresIn) { }
