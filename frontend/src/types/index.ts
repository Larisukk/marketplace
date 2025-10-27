export type UUID = string;

export interface ConversationDTO {
  id: UUID;
  participantIds: UUID[];
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
