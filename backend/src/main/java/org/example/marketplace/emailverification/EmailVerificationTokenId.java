package org.example.marketplace.emailverification;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class EmailVerificationTokenId implements Serializable {
    private UUID userId;
    private String tokenHash;
}
