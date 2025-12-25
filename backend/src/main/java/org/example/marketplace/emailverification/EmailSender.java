package org.example.marketplace.emailverification;

public interface EmailSender {
    void sendEmail(String to, String subject, String body);
}
