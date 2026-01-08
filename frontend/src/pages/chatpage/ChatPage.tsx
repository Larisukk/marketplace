import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../hooks/useChat";
import ChatList from "../../components/chatlist/ChatList";
import ChatWindow from "../../components/chatwindow/ChatWindow";
import ChatSettingsModal from "../../components/chat/ChatSettingsModal";
import styles from "./ChatPage.module.css";

// Persistence keys
const THEME_KEY = "chat_theme";
const FONT_KEY = "chat_font_size";

export default function ChatPage() {
  const { user } = useAuth();
  const { conversations, activeConversationId, actions } = useChat();
  const location = useLocation() as any;

  // -- Settings State --
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem(THEME_KEY) as "light" | "dark") || "light";
  });
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">(() => {
    return (localStorage.getItem(FONT_KEY) as "sm" | "md" | "lg") || "md";
  });
  const [showSettings, setShowSettings] = useState(false);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(FONT_KEY, fontSize);
  }, [theme, fontSize]);

  // Load conversations when user logs in
  useEffect(() => {
    if (user) void actions.loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // If navigated here with a specific conversationId, open it
  useEffect(() => {
    const convId = location.state?.conversationId as string | undefined;
    if (convId) actions.openConversation(convId as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.conversationId]);

  const hasChats = conversations.length > 0;

  return (
    <div className={`${styles['chat-page-container']} ${styles[`theme-${theme}`]} ${styles[`font-${fontSize}`]}`}>
      <ChatSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
      {/* LEFT: list */}
      <div
        className={
          styles['chat-sidebar'] + (activeConversationId ? ` ${styles['chat-sidebar--hidden-mobile']}` : "")
        }
      >
        <div className={styles['chat-sidebar-header']}>
          <div className={styles['chat-sidebar-header-row']}>
            {/* Added home button to leave page */}
            <a href="/home" className={styles['chat-home-link']} title="Inapoi la acasa">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </a>
            <h1 className={styles['chat-sidebar-title']}>Chats</h1>
            <button
              className={styles['chat-settings-btn']}
              onClick={() => setShowSettings(true)}
              title="Setari"
            >
              ⋮
            </button>
          </div>
          <div className={styles['chat-sidebar-subtitle']}>{user ? "Online" : "Offline"}</div>
        </div>

        <ChatList />
      </div>

      {/* RIGHT: window */}
      <div
        className={
          styles['chat-content-area'] + (!activeConversationId ? ` ${styles['chat-content--hidden-mobile']}` : "")
        }
      >
        <div className={styles['chat-topbar']}>
          <button
            type="button"
            className={styles['chat-back-btn']}
            onClick={() => actions.openConversation(null as any)}
          >
            ← inapoi
          </button>

          <div className={styles['chat-topbar-center']}>
            <div className={styles['chat-topbar-title']}>
              {activeConversationId ? "Chat" : "Mesaje"}
            </div>
            <div className={styles['chat-topbar-sub']}>
              {activeConversationId ? "Conversatie deschisa" : hasChats ? "Alege o conversatie" : "Nicio conversatie"}
            </div>
          </div>

          <div className={styles['chat-topbar-spacer']} />
        </div>

        {!activeConversationId && hasChats && (
          <div className={styles['chat-select-state']}>
            <div className={styles['chat-select-icon']}>💬</div>
            <p className={styles['chat-select-message']}>Selecteaza o conversatie pentru a putea incepe sa discutati</p>
          </div>
        )}

        {!hasChats && (
          <div className={styles['chat-empty-state']}>
            <div className={styles['chat-empty-state-icon']}>💬</div>
            <h2 className={styles['chat-empty-state-title']}>Nicio conversatie inca</h2>
            <p className={styles['chat-empty-state-message']}>
              Incepe o noua conversatie din lista cu produse pentru a putea discuta.
            </p>
          </div>
        )}

        {activeConversationId && <ChatWindow />}
      </div>
    </div>
  );
}
