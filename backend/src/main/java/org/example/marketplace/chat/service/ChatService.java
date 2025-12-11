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
import org.example.marketplace.user.UserRepository;
import org.example.marketplace.user.UserEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import java.util.UUID;


import java.util.*;

@Service
public class ChatService {

    private final ConversationRepository conversationRepo;
    private final ConversationParticipantRepository participantRepo;
    private final MessageRepository messageRepo;
    private final UserRepository userRepo;

    public ChatService(ConversationRepository conversationRepo,
                       ConversationParticipantRepository participantRepo,
                       MessageRepository messageRepo,
                       UserRepository userRepo) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
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
        var participantIds = participantRepo.findByConversationId(conversationId)
                                          .stream().map(ConversationParticipant::getUserId).toList();
        var participants = buildParticipantInfo(participantIds);
        return new ConversationDTO(conversationId, participantIds, participants);
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> getUserConversations(UUID userId) {
        var cps = participantRepo.findAll().stream()
                .filter(cp -> cp.getUserId().equals(userId))
                .toList();

        List<ConversationDTO> result = new ArrayList<>();
        for (var cp : cps) {
            var participantIds = participantRepo.findByConversationId(cp.getConversationId())
                    .stream().map(ConversationParticipant::getUserId).toList();
            var participants = buildParticipantInfo(participantIds);
            result.add(new ConversationDTO(cp.getConversationId(), participantIds, participants));
        }
        return result;
    }

    @Transactional
    public MessageDTO send(Authentication auth, SendMessageRequest req) {
        UUID me = currentUserId(auth);
        if (me == null) throw new IllegalStateException("Unauthenticated");

        UUID conversationId = req.conversationId();
        if (!participantRepo.existsByConversationIdAndUserId(conversationId, me)) {
            throw new SecurityException("Not a participant in this conversation");
        }

        Message m = new Message();
        m.setConversationId(conversationId);
        m.setSenderUserId(me);
        m.setBody(req.body());
        m.setCreatedAt(java.time.OffsetDateTime.now());
        m = messageRepo.save(m);

        return new MessageDTO(
                m.getId(), m.getConversationId(), m.getSenderUserId(),
                m.getBody(), m.getCreatedAt(), m.getReadAt()
        );
    }



    @Transactional(readOnly = true)
    public List<MessageDTO> listMessages(UUID conversationId, int page, int size) {
        var msgs = messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId, PageRequest.of(page, size));
        return msgs.stream().map(m -> new MessageDTO(
                m.getId(), m.getConversationId(), m.getSenderUserId(),
                m.getBody(), m.getCreatedAt(), m.getReadAt()
        )).toList();
    }

    // Security helper

    /** Resolve authenticated user's UUID from Authentication (principal name = email). */
    // imports needed:

    // make sure you have this injected in the service:
    // helper: email (principal) -> UserEntity.id
    private UUID currentUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;

        String username = null;
        Object principal = auth.getPrincipal();

        // Case A: principal is Spring Security UserDetails
        if (principal instanceof User u) {
            username = u.getUsername(); // your email
        }
        // Case B: principal is just a String (some setups store the username/email directly)
        else if (principal instanceof String s) {
            username = s; // email
        }

        if (username == null) return null;

        return userRepo.findByEmailIgnoreCase(username)
                .map(u -> u.getId())
                .orElse(null);
    }

    /** True if the authenticated user matches the provided userId OR is ADMIN (checked in @PreAuthorize). */
    public boolean isSameUser(Authentication auth, UUID userId) {
        UUID me = currentUserId(auth);
        return me != null && me.equals(userId);
    }

    /** True if the authenticated user participates in the given conversation. */
    public boolean isParticipant(Authentication auth, UUID conversationId) {
        UUID me = currentUserId(auth);
        if (me == null) return false;
        return participantRepo.existsByConversationIdAndUserId(conversationId, me);
    }

    /** Build participant info list with display names from user IDs. */
    private List<ParticipantInfo> buildParticipantInfo(List<UUID> participantIds) {
        return participantIds.stream()
                .map(userId -> {
                    String displayName = userRepo.findById(userId)
                            .map(UserEntity::getDisplayName)
                            .orElse("Unknown User");
                    return new ParticipantInfo(userId, displayName);
                })
                .toList();
    }

}
