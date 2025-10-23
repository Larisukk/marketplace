package org.example.marketplace.chat.service;

import org.example.marketplace.chat.dto.*;
import org.example.marketplace.chat.entity.Conversation;
import org.example.marketplace.chat.entity.ConversationParticipant;
import org.example.marketplace.chat.entity.Message;
import org.example.marketplace.chat.repository.ConversationParticipantRepository;
import org.example.marketplace.chat.repository.ConversationRepository;
import org.example.marketplace.chat.repository.MessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ChatService {

    private final ConversationRepository conversationRepo;
    private final ConversationParticipantRepository participantRepo;
    private final MessageRepository messageRepo;

    public ChatService(ConversationRepository conversationRepo,
                       ConversationParticipantRepository participantRepo,
                       MessageRepository messageRepo) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.messageRepo = messageRepo;
    }

    @Transactional
    public ConversationDTO startOrGetOneToOne(UUID userA, UUID userB) {
        if (userA.equals(userB)) {
            throw new IllegalArgumentException("Cannot start a conversation with yourself.");
        }

        var ids = participantRepo.findOneToOneConversationIds(userA, userB);
        UUID conversationId;
        if (!ids.isEmpty()) {
            conversationId = ids.get(0);
        } else {
            Conversation c = conversationRepo.save(new Conversation());
            conversationId = c.getId();
            participantRepo.saveAll(List.of(
                new ConversationParticipant(conversationId, userA),
                new ConversationParticipant(conversationId, userB)
            ));
        }
        var participants = participantRepo.findByConversationId(conversationId)
                                          .stream().map(ConversationParticipant::getUserId).toList();
        return new ConversationDTO(conversationId, participants);
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> getUserConversations(UUID userId) {
        var cps = participantRepo.findAll().stream()
                .filter(cp -> cp.getUserId().equals(userId))
                .toList();

        List<ConversationDTO> result = new ArrayList<>();
        for (var cp : cps) {
            var participants = participantRepo.findByConversationId(cp.getConversationId())
                    .stream().map(ConversationParticipant::getUserId).toList();
            result.add(new ConversationDTO(cp.getConversationId(), participants));
        }
        return result;
    }

    @Transactional
    public MessageDTO send(SendMessageRequest req) {
        if (!participantRepo.existsByConversationIdAndUserId(req.conversationId(), req.senderId())) {
            throw new IllegalArgumentException("Sender is not a participant in this conversation.");
        }

        Message m = new Message();
        m.setConversationId(req.conversationId());
        m.setSenderUserId(req.senderId());
        m.setBody(req.body() == null ? "" : req.body().trim());
        var saved = messageRepo.save(m);

        return new MessageDTO(saved.getId(), saved.getConversationId(), saved.getSenderUserId(),
                saved.getBody(), saved.getCreatedAt(), saved.getReadAt());
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> listMessages(UUID conversationId, int page, int size) {
        var msgs = messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId, PageRequest.of(page, size));
        return msgs.stream().map(m -> new MessageDTO(
                m.getId(), m.getConversationId(), m.getSenderUserId(),
                m.getBody(), m.getCreatedAt(), m.getReadAt()
        )).toList();
    }
}
