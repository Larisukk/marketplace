package org.example.marketplace.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthSessionRepository extends JpaRepository<AuthSessionEntity, UUID> {
    Optional<AuthSessionEntity> findByIdAndRevokedAtIsNull(UUID id);
    Optional<AuthSessionEntity> findByUserIdAndRefreshTokenHashAndRevokedAtIsNull(UUID userId, String hash);
}
