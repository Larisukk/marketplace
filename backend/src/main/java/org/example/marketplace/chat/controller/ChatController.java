package org.example.marketplace.chat.controller;

import org.example.marketplace.chat.dto.*;
import org.example.marketplace.chat.service.ChatService;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> myConversations(@RequestParam UUID userId) {
        return ResponseEntity.ok(service.getUserConversations(userId));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageDTO> send(@RequestBody SendMessageRequest req) {
        return ResponseEntity.ok(service.send(req));
    }

    @GetMapping("/messages")
    public ResponseEntity<List<MessageDTO>> list(
            @RequestParam UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(service.listMessages(conversationId, page, size));
    }
}
