import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export default function VerifyEmailPage() {
    const [params] = useSearchParams();
    const token = params.get("token");

    const [message, setMessage] = useState("Verifying your email...");
    const didRun = useRef(false); // <-- împiedică dublu request

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;

        if (!token) {
            setMessage("Invalid verification link.");
            return;
        }

        fetch(`http://localhost:8080/api/auth/verify-email?token=${token}`)
            .then(async res => {
                if (res.ok) {
                    window.location.href = "/email-verified";
                } else {
                    const text = await res.text();
                    setMessage("Verification failed: " + text);
                }
            })
            .catch(() => setMessage("Something went wrong."));
    }, [token]);


    return (
        <div style={{ padding: "30px", textAlign: "center", fontSize: "18px" }}>
            {message}
        </div>
    );
}
