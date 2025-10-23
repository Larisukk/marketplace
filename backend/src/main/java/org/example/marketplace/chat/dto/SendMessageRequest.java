package org.example.marketplace.chat.dto;

import java.util.UUID;

public record SendMessageRequest(UUID conversationId, UUID senderId, String body) {}
