package org.example.marketplace.chat.repository;

import org.example.marketplace.chat.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId, Pageable pageable);
    List<Message> findByConversationIdAndIdLessThanOrderByCreatedAtDesc(UUID conversationId, UUID beforeId, Pageable pageable);
}
