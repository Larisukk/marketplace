package org.example.marketplace.chat.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MessageDTO(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String body,
        OffsetDateTime createdAt,
        OffsetDateTime readAt
) {}
