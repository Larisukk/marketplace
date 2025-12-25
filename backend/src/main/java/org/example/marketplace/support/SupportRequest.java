package org.example.marketplace.support;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SupportRequest(

        @Email
        @NotBlank
        String email,

        @NotBlank
        String message

) {}
