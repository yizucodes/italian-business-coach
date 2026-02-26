/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAVUS_API_KEY: string;
  readonly VITE_PERSONA_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
