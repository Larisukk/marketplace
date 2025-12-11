package org.example.marketplace.chat.controller;

import org.example.marketplace.chat.dto.*;
import org.example.marketplace.chat.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService service;
    public ChatController(ChatService service) { this.service = service; }


    @PostMapping("/conversations/start")
    public ResponseEntity<ConversationDTO> startConversation(@RequestBody StartConversationRequest req) {
        var dto = service.startOrGetOneToOne(req.userA(), req.userB());
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("@chatSecurity.canAccessConversations(authentication, #userId)")
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> myConversations(@RequestParam UUID userId) {
        return ResponseEntity.ok(service.getUserConversations(userId));
    }

    @PreAuthorize("@chatSecurity.canSendToConversation(authentication, #req.conversationId)")
    @PostMapping("/send")
    public ResponseEntity<MessageDTO> send(
            @RequestBody SendMessageRequest req,
            org.springframework.security.core.Authentication auth
    ) {
        return ResponseEntity.ok(service.send(auth, req));
    }


    @PreAuthorize("@chatSecurity.canAccessConversation(authentication, #conversationId)")
    @GetMapping("/messages")
    public ResponseEntity<List<MessageDTO>> list(
            @RequestParam UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(service.listMessages(conversationId, page, size));
    }
}
