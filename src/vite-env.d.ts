/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Diğer environment variables buraya eklenebilir
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
