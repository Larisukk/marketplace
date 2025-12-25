package org.example.marketplace.emailverification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepository
        extends JpaRepository<EmailVerificationToken, EmailVerificationTokenId> {

    Optional<EmailVerificationToken> findById_TokenHash(String tokenHash);
}
