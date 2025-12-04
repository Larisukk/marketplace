import React, { useCallback, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import MessageInput from "./MessageInput";
import { MessageBubble } from "./MessageBubble";

export default function ChatWindow() {
    const { activeConversationId, messages, actions, me } = useChat();

    const msgs = activeConversationId ? messages[activeConversationId] || [] : [];

    useEffect(() => {
        if (activeConversationId) {
            actions.loadMessages(activeConversationId);
        }
    }, [activeConversationId]);

    const onSend = useCallback(
        (text: string) => {
            actions.sendMessage(text);
        },
        [activeConversationId]
    );

    return (
        <div className="content" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div className="messages" style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                {msgs.map((m) => (
                    <MessageBubble key={m.id} me={me!} msg={m} />
                ))}
            </div>

            <MessageInput onSend={onSend} disabled={!activeConversationId} />
        </div>
    );
}
