// frontend/src/context/ChatContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import * as chatApi from "../services/chatApi";
import type { UUID, ConversationDTO, MessageDTO } from "../types";
import { useAuth } from "./AuthContext";

type ChatState = {
  me: UUID | null;
  conversations: ConversationDTO[];
  activeConversationId: UUID | null;
  messages: Record<UUID, MessageDTO[]>;
  loading: boolean;
};

type ChatActions = {
  loadConversations(): Promise<void>;
  openConversation(id: UUID): void;
  startConversation(otherUserId: UUID): Promise<ConversationDTO>;
  loadMessages(id: UUID): Promise<void>;
  sendMessage(text: string): Promise<void>;
};

type ChatContextValue = ChatState & {
  actions: ChatActions;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [me, setMe] = useState<UUID | null>(null);
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [activeConversationId, setActiveConversationId] =
    useState<UUID | null>(null);
  const [messages, setMessages] = useState<Record<UUID, MessageDTO[]>>(
    {} as any
  );
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<Record<UUID, MessageDTO[]>>({} as any);

  // Keep ref in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // When auth user changes, reset / load chats
  useEffect(() => {
    if (user) {
      setMe(user.id);
      // Load conversations inline to avoid any initialization order issues
      void (async () => {
        setLoading(true);
        try {
          const data = await chatApi.getConversations(user.id);
          setConversations((prev) => {
            const prevIds = new Set(prev.map((c) => c.id));
            const newIds = new Set(data.map((c) => c.id));
            if (
              prevIds.size === newIds.size &&
              data.every((c) => prevIds.has(c.id))
            ) {
              return prev;
            }
            return data;
          });
          setActiveConversationId((current) => {
            if (!current && data.length > 0) {
              return data[0].id;
            }
            return current;
          });
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setMe(null);
      setConversations([]);
      setActiveConversationId(null);
      setMessages({} as any);
      messagesRef.current = {} as any;
    }
  }, [user?.id]);

  // Internal helper
  const loadConversationsInternal = useCallback(async (userId: UUID) => {
    setLoading(true);
    try {
      const data = await chatApi.getConversations(userId);
      setConversations((prev) => {
        const prevIds = new Set(prev.map((c) => c.id));
        const newIds = new Set(data.map((c) => c.id));
        if (
          prevIds.size === newIds.size &&
          data.every((c) => prevIds.has(c.id))
        ) {
          return prev;
        }
        return data;
      });
      setActiveConversationId((current) => {
        if (!current && data.length > 0) {
          return data[0].id;
        }
        return current;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    const userId = user?.id ?? me;
    if (!userId) return;
    await loadConversationsInternal(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, me]); // loadConversationsInternal is stable

  // 👇 Move THIS above openConversation
  const loadMessages = useCallback(async (id: UUID) => {
    setLoading(true);
    try {
      const data = await chatApi.getMessages(id, 0, 50);
      setMessages((prev) => ({ ...prev, [id]: data }));
    } finally {
      setLoading(false);
    }
  }, []);

  const openConversation = useCallback(
    (id: UUID) => {
      setActiveConversationId(id);
      // Check if messages are already loaded using ref
      if (!messagesRef.current[id]) {
        void loadMessages(id);
      }
    },
    [loadMessages]
  );

  const startConversation = useCallback(
    async (otherUserId: UUID): Promise<ConversationDTO> => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      const convo = await chatApi.startOrGetConversation({
        userA: user.id,
        userB: otherUserId,
      });

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === convo.id);
        return exists ? prev : [...prev, convo];
      });

      setActiveConversationId(convo.id);

      try {
        await loadMessages(convo.id);
      } catch (error) {
        console.warn(
          "Could not load messages immediately after creating conversation:",
          error
        );
      }

      return convo;
    },
    [user, loadMessages]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !activeConversationId) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const msg = await chatApi.sendMessage({
        conversationId: activeConversationId,
        senderId: user.id,
        body: trimmed,
      });

      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] || []), msg],
      }));
    },
    [user, activeConversationId]
  );

  const value: ChatContextValue = {
    me,
    conversations,
    activeConversationId,
    messages,
    loading,
    actions: {
      loadConversations,
      openConversation,
      startConversation,
      loadMessages,
      sendMessage,
    },
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
};

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return ctx;
}
