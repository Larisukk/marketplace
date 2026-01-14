export function getMailProviderUrl(email: string): string | null {
    const domain = email.split("@")[1]?.toLowerCase();

    if (!domain) return null;

    const providers: Record<string, string> = {
        "gmail.com": "https://mail.google.com",
        "yahoo.com": "https://mail.yahoo.com",
        "yahoo.ro": "https://mail.yahoo.com",
        "outlook.com": "https://outlook.live.com/mail",
        "hotmail.com": "https://outlook.live.com/mail",
        "live.com": "https://outlook.live.com/mail",
        "icloud.com": "https://www.icloud.com/mail",
        "proton.me": "https://mail.proton.me",
        "aol.com": "https://mail.aol.com"
    };

    return providers[domain] || null;
}
