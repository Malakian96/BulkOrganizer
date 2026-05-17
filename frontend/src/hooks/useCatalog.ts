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
  const [sets, setSets]       = useState<string[]>([]);
  const [page, setPage]       = useState<CatalogPage>({ cards: [], total: 0, page: 1, totalPages: 1 });
  const [filter, setFilterState] = useState<CatalogFilter>({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    void getCatalogSets().then(setSets);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getCatalogCards(filter)
      .then(p => { if (!cancelled) { setPage(p); setLoading(false); } })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load catalog');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [filter]);

  const setFilter = useCallback((f: Partial<CatalogFilter>) => {
    setFilterState(prev => ({ ...prev, ...f, page: 1 }));
  }, []);

  const goToPage = useCallback((p: number) => {
    setFilterState(prev => ({ ...prev, page: p }));
  }, []);

  return {
    cards: page.cards,
    total: page.total,
    page: page.page,
    totalPages: page.totalPages,
    loading,
    error,
    filter,
    sets,
    setFilter,
    goToPage,
  };
}
