const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

export interface CatalogCard {
  cardId: string;
  name: string;
  effect: string;
  flavorText: string;
  colors: string[];
  cost: number | null;
  type: string;
  supertype: string | null;
  might: number | null;
  tags: string[];
  set: string;
  setAbbr: string;
  rarity: string;
  imageUrl: string;
  hasFoil: boolean;
  promo: boolean;
  banned: boolean;
}

export interface CatalogPage {
  cards: CatalogCard[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CatalogFilter {
  name?: string;
  set?: string;
  type?: string;
  rarity?: string;
  colors?: string[];
  page?: number;
  limit?: number;
}

export async function searchCatalog(q: string): Promise<CatalogCard[]> {
  if (!q.trim()) return [];
  const res = await fetch(`${BASE}/api/catalog/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return res.json() as Promise<CatalogCard[]>;
}

export async function getCatalogCards(filter: CatalogFilter = {}): Promise<CatalogPage> {
  const qs = new URLSearchParams();
  if (filter.name) qs.set('name', filter.name);
  if (filter.set) qs.set('set', filter.set);
  if (filter.type) qs.set('type', filter.type);
  if (filter.rarity) qs.set('rarity', filter.rarity);
  if (filter.colors?.length) qs.set('colors', filter.colors.join(','));
  if (filter.page) qs.set('page', String(filter.page));
  if (filter.limit) qs.set('limit', String(filter.limit));
  const res = await fetch(`${BASE}/api/catalog?${qs.toString()}`);
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  return res.json() as Promise<CatalogPage>;
}

export async function getCatalogSets(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/catalog/sets`);
  if (!res.ok) return [];
  return res.json() as Promise<string[]>;
}
