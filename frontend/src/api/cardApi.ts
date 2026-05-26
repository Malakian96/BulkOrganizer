import { BulkEditPayload, CardDTO, CreateCardPayload, RemoveCardsPayload } from '../types/card';
import { getStoredToken } from '../context/AuthContext';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    ...init,
  });
  if (res.status === 401) {
    localStorage.removeItem('rift-auth-token');
    localStorage.removeItem('rift-auth-user');
    window.location.reload();
    return undefined as unknown as T;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return (res.status === 204 ? undefined : res.json()) as Promise<T>;
}

export const cardApi = {
  getCards(params?: { name?: string; category?: string; tags?: string[] }): Promise<CardDTO[]> {
    const qs = new URLSearchParams();
    if (params?.name) qs.set('name', params.name);
    if (params?.category) qs.set('category', params.category);
    if (params?.tags?.length) qs.set('tags', params.tags.join(','));
    const query = qs.toString();
    return request<CardDTO[]>(`/api/cards${query ? `?${query}` : ''}`);
  },

  createCard(payload: CreateCardPayload): Promise<CardDTO> {
    return request<CardDTO>('/api/cards', { method: 'POST', body: JSON.stringify(payload) });
  },

  removeCards(payload: RemoveCardsPayload): Promise<void> {
    return request<void>('/api/cards', { method: 'DELETE', body: JSON.stringify(payload) });
  },

  bulkEdit(payload: BulkEditPayload): Promise<CardDTO[]> {
    return request<CardDTO[]>('/api/cards/bulk-edit', { method: 'PATCH', body: JSON.stringify(payload) });
  },
};
