package org.example.marketplace.chat.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages",
       indexes = {
         @Index(name = "idx_messages_conversation_created", columnList = "conversation_id,created_at"),
         @Index(name = "idx_messages_sender", columnList = "sender_user_id")
       })
public class Message {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "sender_user_id", nullable = false)
    private UUID senderUserId;

    @Column(name = "body")
    private String body;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime createdAt;

    @Column(name = "read_at", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime readAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getConversationId() { return conversationId; }
    public void setConversationId(UUID id) { this.conversationId = id; }
    public UUID getSenderUserId() { return senderUserId; }
    public void setSenderUserId(UUID id) { this.senderUserId = id; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getReadAt() { return readAt; }
    public void setReadAt(OffsetDateTime readAt) { this.readAt = readAt; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
