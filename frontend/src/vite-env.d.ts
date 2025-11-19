/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TILE_URL?: string;
    readonly VITE_TILE_ATTRIBUTION?: string;
    readonly VITE_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module "@vitejs/plugin-react";