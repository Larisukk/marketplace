package org.example.marketplace.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;


public record RegisterRequest(
        @NotBlank(message = "Numele nu poate fi gol")
        @Size(min = 2, max = 80, message = "Numele trebuie să aibă între 2 și 80 de caractere")
        String displayName,

        @NotBlank(message = "E-mail obligatoriu")
        @Email(message = "E-mail invalid")
        String email,

        @NotBlank(message = "Parola obligatorie")
        @Size(min = 8, max = 64, message = "Parola trebuie să aibă între 8 și 64 de caractere")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,64}$",
                message = "Parola trebuie să conțină: minim 8 caractere, cel puțin o literă mică, o literă mare, o cifră și un simbol"
        )
        String password
) {}