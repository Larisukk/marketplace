package org.example.marketplace;

import org.example.marketplace.user.UserEntity;
import org.example.marketplace.user.UserRepository;
import org.example.marketplace.user.UserRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String email = "admin@marketplace.com";
        if (!users.existsByEmailIgnoreCase(email)) {
            UserEntity admin = UserEntity.builder()
                    .email(email)
                    .displayName("Admin")
                    .passwordHash(encoder.encode("admin123"))
                    .role(UserRole.ADMIN)
                    .isActive(true)
                    .emailVerifiedAt(OffsetDateTime.now())
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();
            users.save(admin);
            System.out.println("CREATED ADMIN USER: " + email + " / admin123");
        }
    }
}
