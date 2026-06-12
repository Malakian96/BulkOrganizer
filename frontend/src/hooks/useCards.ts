import { useState, useEffect, useCallback } from 'react';
import { cardApi } from '../api/cardApi';
import { BulkEditPayload, CardDTO, CreateCardPayload } from '../types/card';

export interface UseCardsReturn {
  cards: CardDTO[];
  loading: boolean;
  error: string | null;
  addCard: (payload: CreateCardPayload) => Promise<void>;
  deleteCards: (ids: string[]) => Promise<void>;
  editCards: (ids: string[], patch: BulkEditPayload['patch']) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCards(): UseCardsReturn {
  const [cards, setCards] = useState<CardDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cardApi.getCards();
      setCards(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const addCard = useCallback(async (payload: CreateCardPayload) => {
    const card = await cardApi.createCard(payload);
    // The backend merges by cardId — replace the entry if it already exists
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === card.id);
      if (idx < 0) return [card, ...prev];
      const next = [...prev];
      next[idx] = card;
      return next;
    });
  }, []);

  const deleteCards = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    await cardApi.removeCards({ ids });
    setCards((prev) => prev.filter((c) => !ids.includes(c.id)));
  }, []);

  const editCards = useCallback(async (ids: string[], patch: BulkEditPayload['patch']) => {
    if (ids.length === 0) return;
    const updated = await cardApi.bulkEdit({ ids, patch });
    const updatedMap = new Map(updated.map((c) => [c.id, c]));
    setCards((prev) => prev.map((c) => updatedMap.get(c.id) ?? c));
  }, []);

  return { cards, loading, error, addCard, deleteCards, editCards, refresh };
}
