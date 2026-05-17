import { useState, useEffect } from 'react';
import { CatalogCard, getCatalogCards, getCatalogSets } from '../api/catalogApi';

export interface UseCatalogReturn {
  bySet: Map<string, CatalogCard[]>;
  sets: string[];
  loading: boolean;
}

export function useCatalog(): UseCatalogReturn {
  const [bySet, setBySet] = useState<Map<string, CatalogCard[]>>(new Map());
  const [sets, setSets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const rawSets = await getCatalogSets();
      if (cancelled) return;
      const pages = await Promise.all(rawSets.map(s => getCatalogCards({ set: s, limit: 2000 })));
      if (cancelled) return;
      const map = new Map<string, CatalogCard[]>();
      rawSets.forEach((s, i) => map.set(s, pages[i].cards));
      setSets(rawSets);
      setBySet(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { bySet, sets, loading };
}
