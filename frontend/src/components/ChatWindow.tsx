// frontend/src/components/ChatWindow.tsx
import { useEffect, useRef, useState } from "react";
// ⬇️ keep this path if it’s correct in your project
import { useChat } from "../hooks/useChat";
import { useAuth } from "../context/AuthContext";

export default function ChatWindow() {
  const { user } = useAuth();

  // Destructure actions so we can depend only on the functions we need
  const { activeConversationId, messages, actions, loading } = useChat();
  const { loadMessages, sendMessage } = actions;

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const list = activeConversationId ? messages[activeConversationId] || [] : [];

  // ✅ Load messages when active conversation changes,
  // but ONLY if we don't already have messages for it.
  useEffect(() => {
    if (!activeConversationId) return;

    // If this conversation already has messages, don't reload them
    if (messages[activeConversationId]?.length) return;

    void loadMessages(activeConversationId);
  }, [activeConversationId, loadMessages, messages]);

  // Auto-scroll to bottom when messages in the active conversation change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list.length, activeConversationId]);

  if (!activeConversationId) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await sendMessage(trimmed);
    setText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #eee",
          fontWeight: 600,
        }}
      >
        Chat {activeConversationId.slice(0, 8)}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 12px",
          background: "#fafafa",
        }}
      >
        {loading && list.length === 0 && (
          <div style={{ fontSize: 13, color: "#777" }}>Loading messages…</div>
        )}

        {list.map((m) => {
          const isMine = user && m.senderId === user.id;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "6px 10px",
                  borderRadius: 12,
                  fontSize: 14,
                  background: isMine ? "#d0e8ff" : "#ffffff",
                  border: "1px solid #ddd",
                }}
              >
                <div>{m.body}</div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    opacity: 0.6,
                    textAlign: "right",
                  }}
                >
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          borderTop: "1px solid #eee",
          padding: "8px 12px",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          style={{ flex: 1, padding: "6px 8px" }}
        />
        <button type="submit" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
