import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  const { user } = useAuth();
  const { conversations, activeConversationId, actions } = useChat();

  useEffect(() => {
    if (user) {
      actions.setMe(user.id);
      actions.loadConversations();
    }
  }, [user]);

  const hasChats = conversations.length > 0;

  return (
      <div className="container" style={{ display: "flex", height: "100%" }}>
        {/* LEFT SIDE LIST */}
        <div style={{ width: 300, borderRight: "1px solid #ddd" }}>
          {!hasChats && (
              <div style={{ padding: 20, color: "#777" }}>
                <h3>No chats yet 😔</h3>
                <p>Find a user and press “Message” to start chatting.</p>
              </div>
          )}

          {hasChats && <ChatList />}
        </div>

        {/* RIGHT SIDE WINDOW */}
        <div style={{ flex: 1 }}>
          {!activeConversationId && hasChats && (
              <div style={{ padding: 20, color: "#888" }}>
                <h3>Select a chat from the left</h3>
              </div>
          )}

          {activeConversationId && <ChatWindow />}
        </div>
      </div>
  );
}
