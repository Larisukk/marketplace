import React, { createContext, useContext, useMemo, useReducer } from 'react'
import type { ConversationDTO, MessageDTO, UUID } from '../types/index'
import * as api from '../services/chatApi'

type State = {
  me: UUID | null;
  conversations: ConversationDTO[];
  activeConversationId: UUID | null;
  messages: Record<UUID, MessageDTO[]>; // by conversation
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_ME', me: UUID }
  | { type: 'SET_CONVERSATIONS', conversations: ConversationDTO[] }
  | { type: 'SET_ACTIVE', id: UUID | null }
  | { type: 'ADD_MESSAGE', message: MessageDTO }
  | { type: 'SET_MESSAGES', id: UUID, messages: MessageDTO[] }
  | { type: 'SET_LOADING', value: boolean }
  | { type: 'SET_ERROR', error: string | null }

const initial: State = {
  me: null,
  conversations: [],
  activeConversationId: null,
  messages: {},
  loading: false,
  error: null
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ME':
      return { ...state, me: action.me }
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.conversations }
    case 'SET_ACTIVE':
      return { ...state, activeConversationId: action.id }
    case 'ADD_MESSAGE': {
      const arr = state.messages[action.message.conversationId] ?? []
      return {
        ...state,
        messages: { ...state.messages, [action.message.conversationId]: [...arr, action.message] }
      }
    }
    case 'SET_MESSAGES':
      return { ...state, messages: { ...state.messages, [action.id]: action.messages } }
    case 'SET_LOADING':
      return { ...state, loading: action.value }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    default:
      return state
  }
}

type Ctx = State & {
  actions: {
    setMe: (id: UUID) => void
    loadConversations: (userId: UUID) => Promise<void>
    startOrOpen: (userA: UUID, userB: UUID) => Promise<ConversationDTO>
    openConversation: (id: UUID) => void
    loadMessages: (id: UUID, page?: number, size?: number) => Promise<void>
    send: (conversationId: UUID, senderId: UUID, body: string) => Promise<MessageDTO>
  }
}

const ChatContext = createContext<Ctx | null>(null)

export const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initial)

  const actions = useMemo(() => ({
    setMe(id: UUID) { dispatch({ type: 'SET_ME', me: id }) },

    async loadConversations(userId: UUID) {
      dispatch({ type: 'SET_LOADING', value: true })
      try {
        const data = await api.getConversations(userId)
        dispatch({ type: 'SET_CONVERSATIONS', conversations: data })
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', error: e?.message ?? 'Failed loading conversations' })
      } finally {
        dispatch({ type: 'SET_LOADING', value: false })
      }
    },

    async startOrOpen(userA: UUID, userB: UUID) {
      const conv = await api.startOrGetConversation({ userA, userB })
      dispatch({ type: 'SET_ACTIVE', id: conv.id })
      return conv
    },

    openConversation(id: UUID) {
      dispatch({ type: 'SET_ACTIVE', id })
    },

    async loadMessages(id: UUID, page = 0, size = 50) {
      dispatch({ type: 'SET_LOADING', value: true })
      try {
        const msgs = await api.getMessages(id, page, size)
        dispatch({ type: 'SET_MESSAGES', id, messages: msgs })
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', error: e?.message ?? 'Failed loading messages' })
      } finally {
        dispatch({ type: 'SET_LOADING', value: false })
      }
    },

    async send(conversationId: UUID, senderId: UUID, body: string) {
      const msg = await api.sendMessage({ conversationId, senderId, body })
      dispatch({ type: 'ADD_MESSAGE', message: msg })
      return msg
    }
  }), [])

  const value: Ctx = { ...state, actions }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
