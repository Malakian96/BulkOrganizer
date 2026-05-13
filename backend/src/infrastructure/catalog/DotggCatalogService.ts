const DOTGG_URL = 'https://api.dotgg.gg/cgfw/getcards';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface CatalogCard {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  set: string;
}

interface DotggCard {
  id: string;
  name: string;
  effect?: string;
  type?: string;
  color?: string[];
  rarity?: string;
  set_name?: string;
}

let cache: CatalogCard[] | null = null;
let cacheExpiresAt = 0;

async function loadCards(): Promise<CatalogCard[]> {
  if (cache && Date.now() < cacheExpiresAt) return cache;

  console.log('[Catalog] Fetching cards from dotgg.gg...');
  const res = await fetch(DOTGG_URL);
  if (!res.ok) throw new Error(`dotgg.gg responded with ${res.status}`);

  const raw: DotggCard[] = await res.json() as DotggCard[];

  cache = raw.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.effect ?? '',
    category: c.type ?? '',
    tags: c.color ?? [],
    set: c.set_name ?? '',
  }));
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  console.log(`[Catalog] Cached ${cache.length} cards`);
  return cache;
}

export const dotggCatalogService = {
  async search(query: string, limit = 10): Promise<CatalogCard[]> {
    const cards = await loadCards();
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: CatalogCard[] = [];
    for (const card of cards) {
      if (card.name.toLowerCase().includes(q)) results.push(card);
      if (results.length >= limit) break;
    }
    return results;
  },
};
