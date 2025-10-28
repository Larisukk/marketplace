package org.example.marketplace.auth.dto;
public record LoginResponse(String accessToken, long expiresIn, String refreshToken) {}