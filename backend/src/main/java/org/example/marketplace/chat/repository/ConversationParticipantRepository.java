package org.example.marketplace.chat.repository;

import org.example.marketplace.chat.entity.ConversationParticipant;
import org.example.marketplace.chat.entity.ConversationParticipant.ParticipantKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, ParticipantKey> {

    @Query("""
           select cp.conversationId
           from ConversationParticipant cp
           where cp.userId in (:a, :b)
           group by cp.conversationId
           having count(distinct cp.userId) = 2
           """)
    List<UUID> findOneToOneConversationIds(UUID a, UUID b);

    List<ConversationParticipant> findByConversationId(UUID conversationId);

    boolean existsByConversationIdAndUserId(UUID conversationId, UUID userId);
}
