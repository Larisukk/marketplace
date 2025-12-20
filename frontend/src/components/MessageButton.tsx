import React from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import type { UUID } from "../types";

export default function MessageButton({ otherUserId }: { otherUserId: UUID }) {
    const { actions } = useChat();
    const navigate = useNavigate();

    async function handleClick() {
        // start/open conversation with that person
        await actions.startConversation(otherUserId);

        // go to chat page
        navigate("/chat");
    }

    return (
        <button
            onClick={handleClick}
            style={{
                padding: "8px 14px",
                borderRadius: 6,
                backgroundColor: "#4A90E2",
                color: "white",
                border: "none",
                cursor: "pointer",
            }}
        >
            Message
        </button>
    );
}
