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
  // if VITE_API_URL = "http://localhost:8080", this becomes "http://localhost:8080/api"
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api'
})

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') // same key you use in api.ts
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

// --- Chat API functions ---
// --- Chat API functions ---

export function startOrGetConversation(payload: StartConversationRequest) {
  return api
      .post<ConversationDTO>('/chat/conversations/start', payload)
      .then(response => response.data)
}

export function getConversations(userId: UUID) {
  return api
      .get<ConversationDTO[]>('/chat/conversations', { params: { userId } })
      .then(response => response.data)
}

export function sendMessage(payload: SendMessageRequest) {
  return api
      .post<MessageDTO>('/chat/messages', payload)
      .then(response => response.data)
}

export function getMessages(conversationId: UUID, page = 0, size = 50) {
  return api
      .get<MessageDTO[]>('/chat/messages', {
        params: { conversationId, page, size }
      })
      .then(response => response.data)
}
