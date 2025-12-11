export type UUID = string;

export interface ParticipantInfo {
  id: UUID;
  displayName: string;
}

export interface ConversationDTO {
  id: UUID;
  participantIds: UUID[];
  participants: ParticipantInfo[];
}

export interface MessageDTO {
  id: UUID;
  conversationId: UUID;
  senderId: UUID;
  body: string;
  createdAt: string; // ISO
  readAt: string | null;
}

export interface StartConversationRequest {
  userA: UUID;
  userB: UUID;
}

export interface SendMessageRequest {
  conversationId: UUID;
  senderId: UUID;
  body: string;
}
