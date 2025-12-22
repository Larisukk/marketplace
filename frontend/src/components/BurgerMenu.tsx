import { useState } from "react";
import VerticalMenu from "@/components/VerticalMenu";

export default function BurgerMenu() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                aria-label="Open menu"
                onClick={() => setOpen(true)}
                style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.6rem",
                    cursor: "pointer"
                }}
            >
                ☰
            </button>

            <VerticalMenu open={open} onClose={() => setOpen(false)} />
        </>
    );
}
