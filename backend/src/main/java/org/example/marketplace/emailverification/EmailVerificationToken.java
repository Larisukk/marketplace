package org.example.marketplace.emailverification;

import jakarta.persistence.*;
import lombok.*;
import org.example.marketplace.user.UserEntity;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "email_verification_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailVerificationToken {

    @EmbeddedId
    private EmailVerificationTokenId id;

    @ManyToOne
    @MapsId("userId")              // IMPORTANT!!!
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
