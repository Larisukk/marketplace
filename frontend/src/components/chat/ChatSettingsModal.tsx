import React from "react";
import styles from "./ChatSettingsModal.module.css";

type ChatSettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    theme: "light" | "dark";
    setTheme: (t: "light" | "dark") => void;
    fontSize: "sm" | "md" | "lg";
    setFontSize: (s: "sm" | "md" | "lg") => void;
};

export default function ChatSettingsModal({
    isOpen,
    onClose,
    theme,
    setTheme,
    fontSize,
    setFontSize,
}: ChatSettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles['chat-settings-overlay']} onClick={onClose}>
            <div className={styles['chat-settings-modal']} onClick={(e) => e.stopPropagation()}>
                <div className={styles['chat-settings-header']}>
                    <h3>Setari conversatie</h3>
                    <button className={styles['chat-settings-close']} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles['chat-settings-section']}>
                    <h4>Theme</h4>
                    <div className={styles['chat-settings-options']}>
                        <button
                            className={`${styles['chat-option-btn']} ${theme === "light" ? styles['active'] : ""}`}
                            onClick={() => setTheme("light")}
                        >
                            ☀️ Deschis
                        </button>
                        <button
                            className={`${styles['chat-option-btn']} ${theme === "dark" ? styles['active'] : ""}`}
                            onClick={() => setTheme("dark")}
                        >
                            🌙 Inchis
                        </button>
                    </div>
                </div>

                <div className={styles['chat-settings-section']}>
                    <h4>Font Size</h4>
                    <div className={styles['chat-settings-options']}>
                        <button
                            className={`${styles['chat-option-btn']} ${fontSize === "sm" ? styles['active'] : ""}`}
                            onClick={() => setFontSize("sm")}
                            style={{ fontSize: "14px" }}
                        >
                            Aa
                        </button>
                        <button
                            className={`${styles['chat-option-btn']} ${fontSize === "md" ? styles['active'] : ""}`}
                            onClick={() => setFontSize("md")}
                            style={{ fontSize: "16px" }}
                        >
                            Aa
                        </button>
                        <button
                            className={`${styles['chat-option-btn']} ${fontSize === "lg" ? styles['active'] : ""}`}
                            onClick={() => setFontSize("lg")}
                            style={{ fontSize: "20px" }}
                        >
                            Aa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
