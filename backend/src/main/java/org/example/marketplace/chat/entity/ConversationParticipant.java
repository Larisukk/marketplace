package org.example.marketplace.chat.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "conversation_participants")
@IdClass(ConversationParticipant.ParticipantKey.class)
public class ConversationParticipant {

    @Id
    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    public ConversationParticipant() {}
    public ConversationParticipant(UUID conversationId, UUID userId) {
        this.conversationId = conversationId;
        this.userId = userId;
    }

    public UUID getConversationId() { return conversationId; }
    public void setConversationId(UUID conversationId) { this.conversationId = conversationId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public static class ParticipantKey implements Serializable {
        private UUID conversationId;
        private UUID userId;
        public ParticipantKey() {}
        public ParticipantKey(UUID conversationId, UUID userId) {
            this.conversationId = conversationId; this.userId = userId;
        }
        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ParticipantKey that)) return false;
            return Objects.equals(conversationId, that.conversationId) &&
                   Objects.equals(userId, that.userId);
        }
        @Override public int hashCode() {
            return Objects.hash(conversationId, userId);
        }
    }
}
