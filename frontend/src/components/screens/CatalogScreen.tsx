import { useState, useEffect, useMemo, useCallback } from 'react';
import { DesignCard, mapCatalogCard } from '../../mockData';
import { CatalogCard, getCatalogCards, getCatalogSets } from '../../api/catalogApi';
import { TCard } from '../TCard';
import { FilterPanel } from '../FilterPanel';
import { petalBurst } from '../../utils/petals';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface CatalogScreenProps {
  search: string;
  collectionMap: Map<string, number>;
  wishlist: Set<string>;
  favorites: Set<string>;
  onCardClick: (card: DesignCard) => void;
  onToggleFav: (card: DesignCard, el: Element) => void;
  onMarkOwned: (card: DesignCard) => void;
}

const PAGE_SIZE = 80;

export function CatalogScreen({
  search,
  collectionMap,
  wishlist,
  favorites,
  onCardClick,
  onToggleFav,
  onMarkOwned,
}: CatalogScreenProps) {
  const [catalogBySet, setCatalogBySet] = useState<Map<string, CatalogCard[]>>(new Map());
  const [catalogSets, setCatalogSets]   = useState<string[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const rawSets = await getCatalogSets();
      if (cancelled) return;
      const pages = await Promise.all(rawSets.map(s => getCatalogCards({ set: s, limit: 2000 })));
      if (cancelled) return;
      const map = new Map<string, CatalogCard[]>();
      rawSets.forEach((s, i) => map.set(s, pages[i].cards));
      setCatalogSets(rawSets);
      setCatalogBySet(map);
      setCatalogLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);
  const [activeSet, setActiveSet] = useState('');
  const [filters, setFilters] = useState<{
    domains: string[];
    rarities: string[];
    types: string[];
    costRange: [number, number];
    showMissing: boolean;
    showOwned: boolean;
  }>({ domains: [], rarities: [], types: [], costRange: [0, 12], showMissing: true, showOwned: true });
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  // Set the active set once catalog data arrives
  useEffect(() => {
    if (catalogSets.length > 0 && !activeSet) setActiveSet(catalogSets[0]);
  }, [catalogSets, activeSet]);

  // Attach scroll listener to the .content container — direct querySelector, no DOM walk
  useEffect(() => {
    const container = document.querySelector<HTMLElement>('.content');
    if (!container) return;
    const onScroll = () => {
      const remaining = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (remaining < 300) setDisplayLimit(l => l + PAGE_SIZE);
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // Reset display limit and scroll to top when set, filters, or search changes
  useEffect(() => {
    setDisplayLimit(PAGE_SIZE);
    const container = document.querySelector<HTMLElement>('.content');
    if (container) container.scrollTop = 0;
  }, [activeSet, filters, search]);

  // Per-set stats — keyed by set id, independent of activeSet
  const setTabStats = useMemo(
    () => catalogSets.map(id => {
      const cards = catalogBySet.get(id) ?? [];
      const total = cards.length;
      const owned = cards.filter(c => (collectionMap.get(c.cardId) ?? 0) > 0).length;
      return { id, name: id, total, owned, pct: total ? owned / total : 0 };
    }),
    [catalogSets, catalogBySet, collectionMap],
  );

  // Mapped cards for the active set only
  const allSetCards = useMemo(() => {
    const cards = catalogBySet.get(activeSet) ?? [];
    return cards.map(c => mapCatalogCard(c, collectionMap.get(c.cardId) ?? 0, wishlist, favorites));
  }, [catalogBySet, activeSet, collectionMap, wishlist, favorites]);

  const setCards = useMemo(() => {
    const base = allSetCards.map(c => ({
      ...c,
      owned: collectionMap.get(c.cardId) ?? c.owned,
      wishlist: wishlist.has(c.cardId),
      fav: favorites.has(c.cardId),
    }));
    let r = base;
    const q = search.trim().toLowerCase();
    if (q) r = r.filter(c => c.name.toLowerCase().includes(q) || (c.num ?? '').includes(q));
    if (filters.domains.length) r = r.filter(c => filters.domains.includes(c.domain));
    if (filters.rarities.length) r = r.filter(c => filters.rarities.includes(c.rarity));
    if (filters.types.length) r = r.filter(c => filters.types.some(t => c.type.toLowerCase() === t.toLowerCase()));
    const [lo, hi] = filters.costRange;
    if (lo > 0 || hi < 12) r = r.filter(c => { const cost = c.cost ?? 0; return cost >= lo && cost <= hi; });
    if (!filters.showMissing) r = r.filter(c => c.owned > 0);
    if (!filters.showOwned) r = r.filter(c => c.owned === 0);
    return r;
  }, [allSetCards, collectionMap, wishlist, favorites, search, filters]);

  const toggle = useCallback((key: 'domains' | 'rarities' | 'types', val: string) => {
    setFilters(f => {
      const cur = f[key];
      return { ...f, [key]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
    });
  }, []);

  const activeTabStats = setTabStats.find(s => s.id === activeSet);
  const ownedInSet = setCards.filter(c => c.owned > 0).length;
  const missingInSet = setCards.length - ownedInSet;
  const visible = setCards.slice(0, displayLimit);

  return (
    <div>
      <div className="section-head">
        <div><h2>Catalog</h2></div>
        <div className="meta">{catalogSets.length} sets</div>
      </div>

      {catalogSets.length > 0 && (
        <div className="set-tabs">
          {setTabStats.map(s => (
            <button
              key={s.id}
              className={'set-tab' + (activeSet === s.id ? ' active' : '')}
              onClick={() => setActiveSet(s.id)}
            >
              <div className="id">{s.id}</div>
              <div className="nm">{s.name}</div>
              <div className="row">
                <span className="pct">{Math.round(s.pct * 100)}%</span>
                <span className="of">{s.owned} / {s.total}</span>
              </div>
              <div className="progress"><div className="pfill" style={{ width: `${s.pct * 100}%` }} /></div>
            </button>
          ))}
        </div>
      )}

      {activeTabStats && (
        <div className="catalog-bar">
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600 }}>{activeTabStats.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 2 }}>
              {activeTabStats.id} · {setCards.length} printed
            </div>
          </div>
          <div className="totals">
            <div className="t-block"><div className="k">Owned</div><div className="v">{ownedInSet}</div></div>
            <div className="t-block"><div className="k">Missing</div><div className="v" style={{ color: 'var(--vermillion)' }}>{missingInSet}</div></div>
          </div>
        </div>
      )}

      <div className="screen-layout">
        <FilterPanel
          selectedDomains={filters.domains}
          onToggleDomain={d => toggle('domains', d)}
          selectedRarities={filters.rarities}
          onToggleRarity={r => toggle('rarities', r)}
          selectedTypes={filters.types}
          onToggleType={t => toggle('types', t)}
          costRange={filters.costRange}
          onCostRangeChange={r => setFilters(f => ({ ...f, costRange: r }))}
          showOwned={filters.showOwned}
          onToggleShowOwned={() => setFilters(f => ({ ...f, showOwned: !f.showOwned }))}
          showMissing={filters.showMissing}
          onToggleShowMissing={() => setFilters(f => ({ ...f, showMissing: !f.showMissing }))}
        />

        <div className="screen-main">
          {catalogLoading ? (
            <LoadingSpinner />
          ) : setCards.length === 0 ? (
            <div className="empty">
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--ink-300)' }}>無</div>
              <h3>Nothing in this slice</h3>
              <p>{catalogSets.length === 0 ? 'Run the scraper to populate the catalog.' : 'Adjust filters or pick another set.'}</p>
            </div>
          ) : (
            <>
              <div className="card-grid">
                {visible.map(c => (
                  <TCard
                    key={c.id} card={c}
                    missing={c.owned === 0}
                    selected={false}
                    onClick={onCardClick}
                    onToggleFav={(card, el) => { onToggleFav(card, el); petalBurst(el, 4); }}
                    onMarkOwned={(card, el) => { onMarkOwned(card); petalBurst(el, 7); }}
                  />
                ))}
              </div>
              {displayLimit < setCards.length && (
                <div style={{ height: 1, marginBottom: 32 }} aria-hidden="true" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
