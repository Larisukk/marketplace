package org.example.marketplace.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record SendMessageRequest(
        @NotNull(message = "Conversation ID is required")
        UUID conversationId,
        
        @NotBlank(message = "Message body cannot be empty")
        @Size(max = 5000, message = "Message cannot exceed 5000 characters")
        String body
) {}
