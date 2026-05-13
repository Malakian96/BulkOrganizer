import { useState, useEffect, useCallback } from 'react';
import { cardApi } from '../api/cardApi';
import { BulkEditPayload, CardDTO, CreateCardPayload } from '../types/card';

export interface UseCardsReturn {
  cards: CardDTO[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  isAllSelected: boolean;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  addCard: (payload: CreateCardPayload) => Promise<void>;
  removeSelected: () => Promise<void>;
  bulkEdit: (patch: BulkEditPayload['patch']) => Promise<void>;
  deleteCards: (ids: string[]) => Promise<void>;
  editCards: (ids: string[], patch: BulkEditPayload['patch']) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCards(): UseCardsReturn {
  const [cards, setCards] = useState<CardDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isAllSelected = cards.length > 0 && selectedIds.size === cards.length;

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(isAllSelected ? new Set() : new Set(cards.map((c) => c.id)));
  }, [cards, isAllSelected]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const addCard = useCallback(async (payload: CreateCardPayload) => {
    const card = await cardApi.createCard(payload);
    setCards((prev) => [card, ...prev]);
  }, []);

  const removeSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    await cardApi.removeCards({ ids: [...selectedIds] });
    setCards((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    clearSelection();
  }, [selectedIds, clearSelection]);

  const bulkEdit = useCallback(
    async (patch: BulkEditPayload['patch']) => {
      const updated = await cardApi.bulkEdit({ ids: [...selectedIds], patch });
      const updatedMap = new Map(updated.map((c) => [c.id, c]));
      setCards((prev) => prev.map((c) => updatedMap.get(c.id) ?? c));
      clearSelection();
    },
    [selectedIds, clearSelection]
  );

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

  return {
    cards,
    loading,
    error,
    selectedIds,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    addCard,
    removeSelected,
    bulkEdit,
    deleteCards,
    editCards,
    refresh,
  };
}
