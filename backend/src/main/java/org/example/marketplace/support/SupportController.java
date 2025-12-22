package org.example.marketplace.support;

import org.example.marketplace.emailverification.EmailSender;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final EmailSender emailSender;

    public SupportController(EmailSender emailSender) {
        this.emailSender = emailSender;
    }

    @PostMapping("/contact")
    public ResponseEntity<Void> contact(@RequestBody SupportRequest req) {

        emailSender.sendEmail(
                "biobuy.verif@gmail.com",
                "Mesaj suport BioBuy",
                "Email utilizator: " + req.email() + "\n\n" +
                        "Mesaj:\n" + req.message()
        );

        return ResponseEntity.ok().build();
    }
}
