// frontend/src/components/ChatList.tsx
import { useChat } from "../hooks/useChat";

export default function ChatList() {
    const { conversations, activeConversationId, actions } = useChat();

    if (!conversations.length) {
        return (
            <div style={{ padding: 16, fontSize: 14, color: "#777" }}>
                No conversations yet.
            </div>
        );
    }

    return (
        <div>
            {conversations.map((c) => {
                const isActive = c.id === activeConversationId;

                return (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => actions.openConversation(c.id)}
                        style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 12px",
                            border: "none",
                            borderBottom: "1px solid #eee",
                            background: isActive ? "#eef2ff" : "transparent",
                            cursor: "pointer",
                            fontSize: 14,
                        }}
                    >
                        <div style={{ fontWeight: 600 }}>
                            Conversation {c.id.slice(0, 8)}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
