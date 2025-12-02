package org.example.marketplace.emailverification;

import lombok.RequiredArgsConstructor;
import org.example.marketplace.user.UserEntity;
import org.example.marketplace.user.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepo;
    private final UserRepository userRepo;

    public String createToken(UserEntity user) {
        // token raw trimis pe email
        String rawToken = UUID.randomUUID().toString();

        // hash (exact ca în DB)
        String hash = hashToken(rawToken);

        // creăm ID compus
        EmailVerificationTokenId id = new EmailVerificationTokenId(
                user.getId(),
                hash
        );

        EmailVerificationToken token = EmailVerificationToken.builder()
                .id(id)
                .user(user)
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .build();

        tokenRepo.save(token);

        return rawToken;
    }

    public void verify(String rawToken) {
        String hashed = hashToken(rawToken);

        // IMPORTANT — metoda corectă
        EmailVerificationToken evt = tokenRepo.findById_TokenHash(hashed)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (evt.getExpiresAt().isBefore(OffsetDateTime.now())) {
            tokenRepo.delete(evt);
            throw new RuntimeException("Token expired");
        }

        UserEntity user = evt.getUser();
        user.setEmailVerifiedAt(OffsetDateTime.now());
        userRepo.save(user);

        tokenRepo.delete(evt);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
