// frontend/src/components/ChatList.tsx
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../context/AuthContext";
import styles from "./ChatList.module.css";

export default function ChatList() {
  const { user } = useAuth();
  const { conversations, activeConversationId, messages, actions } = useChat();

  if (!conversations.length) {
    return (
      <div style={{ padding: 16, fontSize: 14, color: "#777" }}>
        Nicio conversatie inca.
      </div>
    );
  }

  return (
    <div className={styles['chatlist-container']}>
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
        const lastMsg = last?.body || "Nicio conversatie inca";

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => actions.openConversation(c.id)}
            className={`${styles['chatlist-row']} ${isActive ? styles['active'] : ""}`}
            title={name}
          >
            <div className={styles['chatlist-avatar']}>
              {/* Placeholder for avatar image or initial */}
              {name.charAt(0).toUpperCase()}
            </div>

            <div className={styles['chatlist-content']}>
              <div className={styles['chatlist-header']}>
                <span className={styles['chatlist-name']}>{name}</span>
                {/* Optional time placeholder or real data if available */}
                {/* <span className={styles['chatlist-time']}>12:30</span> */}
              </div>
              <div className={styles['chatlist-lastmsg']}>{lastMsg}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
