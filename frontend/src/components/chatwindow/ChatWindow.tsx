// frontend/src/components/ChatWindow.tsx
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../context/AuthContext";
import "./ChatWindow.css";

export default function ChatWindow() {
  const { user } = useAuth();
  const { conversations, activeConversationId, messages, actions, loading } =
    useChat();
  const { loadMessages, sendMessage } = actions;

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const list = activeConversationId ? messages[activeConversationId] || [] : [];

  // Load messages once per conversation (if not already loaded)
  useEffect(() => {
    if (!activeConversationId) return;
    if (messages[activeConversationId]?.length) return;
    void loadMessages(activeConversationId);
  }, [activeConversationId, loadMessages, messages]);

  // Auto-scroll when list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list.length, activeConversationId]);

  if (!activeConversationId) {
    return null;
  }

  // === header name based on participants ===
  const currentConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const otherParticipant = currentConversation?.participants.find(
    (p) => p.id !== user?.id
  ) ?? currentConversation?.participants[0];

  const title =
    otherParticipant && otherParticipant.id !== user?.id
      ? `Chat with ${otherParticipant.displayName}`
      : "Chat";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await sendMessage(trimmed);
    setText("");
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">{title}</div>

      {/* Messages */}
      <div className="chat-messages">
        {loading && list.length === 0 && (
          <div className="chat-loading">Loading messages…</div>
        )}

        {list.map((m) => {
          const isMine = user && m.senderId === user.id;
          const rowClass = isMine
            ? "chat-message-row mine"
            : "chat-message-row theirs";
          const bubbleClass = isMine
            ? "chat-bubble mine"
            : "chat-bubble theirs";

          return (
            <div key={m.id} className={rowClass}>
              <div className={bubbleClass}>
                <div>{m.body}</div>
                <div className="chat-time">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          maxLength={5000}
        />
        <button
          className="chat-send-btn"
          type="submit"
          disabled={!text.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
