package org.example.marketplace.auth.dto;

import java.util.UUID;

public record MeResponse(UUID id, String email, String displayName, String role) { }
