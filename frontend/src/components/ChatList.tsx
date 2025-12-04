import React from "react";
import { useChat } from "../hooks/useChat";

export default function ChatList() {
  const { conversations, activeConversationId, actions, me } = useChat();

  return (
      <div>
        {conversations.map((c) => {
          const other = c.participantIds.find((id) => id !== me);
          const active = c.id === activeConversationId;

          return (
              <div
                  key={c.id}
                  onClick={() => actions.openConversation(c.id)}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    background: active ? "#e4f1ff" : "transparent",
                    borderBottom: "1px solid #eee",
                  }}
              >
                <strong>Chat</strong>
                <div style={{ fontSize: 12, opacity: 0.7 }}>with {other}</div>
              </div>
          );
        })}
      </div>
  );
}
