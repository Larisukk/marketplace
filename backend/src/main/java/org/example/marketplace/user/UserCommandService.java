package org.example.marketplace.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserCommandService {
    private final UserRepository repo;

    public UserCommandService(UserRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void toggleActive(UUID userId, boolean active) {
        UserEntity user = repo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(active);
        repo.save(user);
    }
}
