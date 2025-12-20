package org.example.marketplace.chat.dto;

import java.util.UUID;

public record StartConversationRequest(UUID userA, UUID userB) {}
