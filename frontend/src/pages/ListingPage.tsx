// frontend/src/pages/ListingPage.tsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";

export default function ListingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation() as { state?: { sellerId?: string; autoStartChat?: boolean } };

    const { user } = useAuth();
    const { actions } = useChat();
    const hasAutoStartedRef = useRef(false);

    const sellerId = location.state?.sellerId;
    const autoStartChat = location.state?.autoStartChat !== false; // Default to true

    // Auto-start chat when page loads (if user is logged in and sellerId is available)
    useEffect(() => {
        if (hasAutoStartedRef.current) return;
        if (!user || !sellerId || !autoStartChat) return;

        hasAutoStartedRef.current = true;
        void (async () => {
            try {
                const convo = await actions.startConversation(sellerId as any);
                navigate("/chat", { state: { conversationId: convo.id } });
            } catch (error) {
                console.error("Failed to auto-start conversation:", error);
                // Don't show alert on auto-start failure, let user manually click button
            }
        })();
    }, [user, sellerId, autoStartChat, actions, navigate]);

    const handleStartChat = async () => {
        if (!id) return;

        if (!sellerId) {
            alert("Seller information is not available for this listing.");
            return;
        }

        // 🔥 NEW: If the user is not logged in → redirect to /auth
        if (!user) {
            navigate("/auth", {
                state: {
                    redirectAfterLogin: `/listings/${id}`,
                    sellerId,
                    autoStartChat: true,
                },
            });
            return;
        }

        // USER IS LOGGED IN → Start or get chat
        try {
            const convo = await actions.startConversation(sellerId as any);
            navigate("/chat", { state: { conversationId: convo.id } });
        } catch (error) {
            console.error("Failed to start conversation:", error);
            alert("Failed to start chat. Please try again.");
        }
    };

    return (
        <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Listing details
            </h2>

            <p style={{ marginBottom: 16 }}>
                Listing id: <code>{id}</code>
            </p>

            <p style={{ marginBottom: 24 }}>
                This page is a placeholder. Later you can fetch and show full listing details here.
            </p>

            <button
                type="button"
                onClick={handleStartChat}
                style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    background: "#111827",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                }}
            >
                Start chat with seller
            </button>

            {!sellerId && (
                <p style={{ marginTop: 12, fontSize: 13, color: "#b91c1c" }}>
                    No sellerId was passed from the previous page. Make sure MapPage / SearchTester
                    call navigate("/listings/:id", &#123; state: &#123; sellerId &#125; &#125;).
                </p>
            )}
        </div>
    );
}
