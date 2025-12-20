package org.example.marketplace.chat.security;

import org.example.marketplace.chat.service.ChatService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("chatSecurity")
public class ChatSecurity {

    private final ChatService chatService;

    public ChatSecurity(ChatService chatService) {
        this.chatService = chatService;
    }

    public boolean canAccessConversations(Authentication auth, UUID userId) {
        return hasRole(auth, "ADMIN") || chatService.isSameUser(auth, userId);
    }

    public boolean canAccessConversation(Authentication auth, UUID conversationId) {
        return hasRole(auth, "ADMIN") || chatService.isParticipant(auth, conversationId);
    }

    public boolean canSendToConversation(Authentication auth, UUID conversationId) {
        return hasRole(auth, "ADMIN") || chatService.isParticipant(auth, conversationId);
    }

    private boolean hasRole(Authentication auth, String role) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}
