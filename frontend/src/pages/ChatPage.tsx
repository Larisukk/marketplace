// frontend/src/pages/ChatPage.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import ChatList from "../components/chatlist/ChatList";
import ChatWindow from "../components/chatwindow/ChatWindow";
import "./ChatPage.css";

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
        <div className="chat-page-container">
            {/* LEFT: conversation list */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h1 className="chat-sidebar-title">Chats</h1>
                </div>
                <ChatList />
            </div>

            {/* RIGHT: window */}
            <div className="chat-content-area">
                {!activeConversationId && hasChats && (
                    <div className="chat-select-state">
                        <div className="chat-select-icon">💬</div>
                        <p className="chat-select-message">Select a conversation to start chatting</p>
                    </div>
                )}

                {!hasChats && (
                    <div className="chat-empty-state">
                        <div className="chat-empty-state-icon">💬</div>
                        <h2 className="chat-empty-state-title">No conversations yet</h2>
                        <p className="chat-empty-state-message">
                            Start a new conversation from a listing or profile page to begin chatting.
                        </p>
                    </div>
                )}

                {activeConversationId && <ChatWindow />}
            </div>
        </div>
    );
}
