// frontend/src/pages/ChatPage.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import ChatList from "../components/chatlist/ChatList";
import ChatWindow from "../components/chatwindow/ChatWindow";

export default function ChatPage() {
    const { user } = useAuth();
    const { conversations, activeConversationId, actions } = useChat();
    const location = useLocation() as any;

    // Load conversations when user logs in
    useEffect(() => {
        if (user) {
            void actions.loadConversations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // If navigated here with a specific conversationId, open it
    useEffect(() => {
        const convId = location.state?.conversationId as string | undefined;
        if (convId) {
            actions.openConversation(convId as any);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state?.conversationId]);

    const hasChats = conversations.length > 0;

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* LEFT: conversation list */}
            <div style={{ width: 260, borderRight: "1px solid #eee" }}>
                <div style={{ padding: 12, fontWeight: 600 }}>Chats</div>
                <ChatList />
            </div>

            {/* RIGHT: window */}
            <div style={{ flex: 1 }}>
                {!activeConversationId && hasChats && (
                    <div style={{ padding: 20, color: "#888" }}>
                        <h3>Select a chat from the left</h3>
                    </div>
                )}

                {!hasChats && (
                    <div style={{ padding: 20, color: "#888" }}>
                        <h3>No conversations yet.</h3>
                    </div>
                )}

                {activeConversationId && <ChatWindow />}
            </div>
        </div>
    );
}
