// frontend/src/components/ChatList.tsx
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../context/AuthContext";
import "./ChatList.css";

export default function ChatList() {
  const { user } = useAuth();
  const { conversations, activeConversationId, messages, actions } = useChat();

  if (!conversations.length) {
    return (
      <div style={{ padding: 16, fontSize: 14, color: "#777" }}>
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="chatlist-container">
      {conversations.map((c) => {
        const isActive = c.id === activeConversationId;

        // one-to-one: get the other participant's info
        const otherParticipant = c.participants.find(
          (p) => p.id !== user?.id
        ) ?? c.participants[0];

        const name =
          otherParticipant && otherParticipant.id !== user?.id
            ? otherParticipant.displayName
            : "You";

        const last = messages[c.id]?.slice(-1)[0];
        const lastMsg = last?.body || "No messages yet";

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => actions.openConversation(c.id)}
            className={`chatlist-row ${isActive ? "active" : ""}`}
          >
            <div className="chatlist-avatar" />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="chatlist-name">{name}</div>
              <div className="chatlist-lastmsg">{lastMsg}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
