package org.example.marketplace.chat.dto;

import java.util.List;
import java.util.UUID;

public record ConversationDTO(UUID id, List<UUID> participantIds) {}
