import React, { createContext, useContext, useReducer, useMemo } from "react";
import * as api from "../services/chatApi";
import type { UUID, ConversationDTO, MessageDTO } from "../types";

type State = {
  me: UUID | null;
  conversations: ConversationDTO[];
  activeConversationId: UUID | null;
  messages: Record<UUID, MessageDTO[]>;
  loading: boolean;
};

type Action =
    | { type: "SET_ME"; me: UUID }
    | { type: "SET_CONVERSATIONS"; data: ConversationDTO[] }
    | { type: "SET_ACTIVE"; id: UUID | null }
    | { type: "SET_MESSAGES"; id: UUID; data: MessageDTO[] }
    | { type: "ADD_MESSAGE"; msg: MessageDTO }
    | { type: "SET_LOADING"; v: boolean };

const initial: State = {
  me: null,
  conversations: [],
  activeConversationId: null,
  messages: {},
  loading: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ME":
      return { ...state, me: action.me };
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.data };
    case "SET_ACTIVE":
      return { ...state, activeConversationId: action.id };
    case "SET_MESSAGES":
      return {
        ...state,
        messages: { ...state.messages, [action.id]: action.data },
      };
    case "ADD_MESSAGE": {
      const arr = state.messages[action.msg.conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.msg.conversationId]: [...arr, action.msg],
        },
      };
    }
    case "SET_LOADING":
      return { ...state, loading: action.v };
    default:
      return state;
  }
}

type Ctx = State & {
  actions: {
    setMe(id: UUID): void;
    loadConversations(): Promise<void>;
    openConversation(id: UUID): void;
    startConversation(otherUserId: UUID): Promise<void>;
    loadMessages(id: UUID): Promise<void>;
    sendMessage(text: string): Promise<void>;
  };
};

const ChatContext = createContext<Ctx | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const actions = useMemo(() => {
    return {
      setMe(id: UUID) {
        dispatch({ type: "SET_ME", me: id });
      },

      async loadConversations() {
        if (!state.me) return;
        dispatch({ type: "SET_LOADING", v: true });
        const data = await api.getConversations(state.me);
        dispatch({ type: "SET_CONVERSATIONS", data });
        dispatch({ type: "SET_LOADING", v: false });
      },

      openConversation(id: UUID) {
        dispatch({ type: "SET_ACTIVE", id });
      },

      async startConversation(otherUserId: UUID) {
        if (!state.me) return;
        const conv = await api.startOrGetConversation({
          userA: state.me,
          userB: otherUserId,
        });
        dispatch({ type: "SET_ACTIVE", id: conv.id });
        await actions.loadConversations();
      },

      async loadMessages(id: UUID) {
        const msgs = await api.getMessages(id, 0, 100);
        dispatch({ type: "SET_MESSAGES", id, data: msgs });
      },

      async sendMessage(text: string) {
        if (!state.me || !state.activeConversationId) return;
        const msg = await api.sendMessage({
          conversationId: state.activeConversationId,
          senderId: state.me,
          body: text,
        });
        dispatch({ type: "ADD_MESSAGE", msg });
      },
    };
  }, [state.me, state.activeConversationId]);

  return (
      <ChatContext.Provider value={{ ...state, actions }}>
        {children}
      </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be inside ChatProvider");
  return ctx;
}
