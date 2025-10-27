import axios from 'axios'
import type {
  ConversationDTO,
  MessageDTO,
  SendMessageRequest,
  StartConversationRequest,
  UUID
} from '../types/index'

// Create the Axios client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
})

// --- Chat API functions ---

export function startOrGetConversation(payload: StartConversationRequest) {
  return api
      .post<ConversationDTO>('/api/chat/conversations/start', payload)
      .then(response => response.data)
}

export function getConversations(userId: UUID) {
  return api
      .get<ConversationDTO[]>('/api/chat/conversations', { params: { userId } })
      .then(response => response.data)
}

export function sendMessage(payload: SendMessageRequest) {
  return api
      .post<MessageDTO>('/api/chat/messages', payload)
      .then(response => response.data)
}

export function getMessages(conversationId: UUID, page = 0, size = 50) {
  return api
      .get<MessageDTO[]>('/api/chat/messages', {
        params: { conversationId, page, size }
      })
      .then(response => response.data)
}
