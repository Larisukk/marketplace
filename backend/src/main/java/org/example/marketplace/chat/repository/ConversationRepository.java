package org.example.marketplace.chat.repository;

import org.example.marketplace.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
}
