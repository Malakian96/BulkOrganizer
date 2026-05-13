import { useState, useEffect, useCallback } from 'react';
import { CatalogCard, CatalogFilter, CatalogPage, getCatalogCards, getCatalogSets } from '../api/catalogApi';

export interface UseCatalogReturn {
  cards: CatalogCard[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filter: CatalogFilter;
  sets: string[];
  setFilter: (f: Partial<CatalogFilter>) => void;
  goToPage: (p: number) => void;
}

export function useCatalog(): UseCatalogReturn {
  const [result, setResult] = useState<CatalogPage>({ cards: [], total: 0, page: 1, totalPages: 0 });
  const [filter, setFilterState] = useState<CatalogFilter>({ page: 1, limit: 48 });
  const [sets, setSets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getCatalogSets().then(setSets);
  }, []);

  useEffect(() => {
    setLoading(true);
    void getCatalogCards(filter)
      .then((r) => { setResult(r); setError(null); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load catalog'))
      .finally(() => setLoading(false));
  }, [filter]);

  const setFilter = useCallback((partial: Partial<CatalogFilter>) => {
    setFilterState((prev) => ({ ...prev, ...partial, page: 1 }));
  }, []);

  const goToPage = useCallback((p: number) => {
    setFilterState((prev) => ({ ...prev, page: p }));
  }, []);

  return {
    cards: result.cards,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    loading,
    error,
    filter,
    sets,
    setFilter,
    goToPage,
  };
}
