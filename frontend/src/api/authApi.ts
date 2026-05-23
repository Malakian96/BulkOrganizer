const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function googleSignIn(credential: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Auth failed: ${res.status}`);
  }
  return res.json() as Promise<AuthResponse>;
}
