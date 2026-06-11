// Backend base URL. Empty string means same-origin (proxied by Vite in dev,
// nginx in production). Set VITE_API_URL to reach the backend directly.
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
