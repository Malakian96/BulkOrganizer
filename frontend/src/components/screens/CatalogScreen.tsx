import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

interface SetEntry {
  id: string;
  name: string;
  cards: CatalogCard[];
}

const PAGE_SIZE = 80;

export function CatalogScreen({ search, collectionMap, wishlist, favorites, onCardClick, onToggleFav, onMarkOwned }: CatalogScreenProps) {
  // Each entry holds raw catalog cards for one set — never changes after initial load
  const [setEntries, setSetEntries] = useState<SetEntry[]>([]);
  const [activeSet, setActiveSet] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    domains: string[];
    rarities: string[];
    types: string[];
    costRange: [number, number];
    showMissing: boolean;
    showOwned: boolean;
  }>({ domains: [], rarities: [], types: [], costRange: [0, 12], showMissing: true, showOwned: true });
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  // Ref used to find the scrollable ancestor and attach the scroll listener
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollElRef = useRef<HTMLElement | null>(null);

  // Load all sets and all their cards upfront in parallel
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const rawSets = await getCatalogSets();
      if (cancelled) return;

      const pages = await Promise.all(
        rawSets.map(s => getCatalogCards({ set: s, limit: 2000 }))
      );
      if (cancelled) return;

      const entries: SetEntry[] = rawSets.map((s, i) => ({
        id: s,
        name: s,
        cards: pages[i].cards,
      }));

      setSetEntries(entries);
      if (entries.length > 0) setActiveSet(entries[0].id);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Find the scrollable ancestor once after mount and attach a scroll listener
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Walk up the DOM to find the element with overflow-y: auto/scroll
    let el: HTMLElement | null = wrapper.parentElement;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') break;
      el = el.parentElement;
    }
    if (!el) return;
    scrollElRef.current = el;

    const onScroll = () => {
      const container = scrollElRef.current;
      if (!container) return;
      const remaining = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (remaining < 300) {
        setDisplayLimit(l => l + PAGE_SIZE);
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el!.removeEventListener('scroll', onScroll);
  }, []); // runs once after mount

  // Reset display limit when set, filters, or search changes
  useEffect(() => {
    setDisplayLimit(PAGE_SIZE);
    // Scroll the container back to top when switching sets
    if (scrollElRef.current) scrollElRef.current.scrollTop = 0;
  }, [activeSet, filters, search]);

  // Per-set stats — each entry reads from its own slot in setEntries, independent of activeSet
  const setTabStats = useMemo(
    () => setEntries.map(entry => {
      const total = entry.cards.length;
      const owned = entry.cards.filter(c => (collectionMap.get(c.cardId) ?? 0) > 0).length;
      return { id: entry.id, name: entry.name, total, owned, pct: total ? owned / total : 0 };
    }),
    [setEntries, collectionMap],
  );

  // Mapped cards for the active set only
  const allSetCards = useMemo(() => {
    const entry = setEntries.find(e => e.id === activeSet);
    if (!entry) return [];
    return entry.cards.map(c =>
      mapCatalogCard(c, collectionMap.get(c.cardId) ?? 0, wishlist, favorites)
    );
  }, [setEntries, activeSet, collectionMap, wishlist, favorites]);

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

  const currentEntry = setEntries.find(e => e.id === activeSet);
  const ownedInSet = setCards.filter(c => c.owned > 0).length;
  const missingInSet = setCards.length - ownedInSet;
  const visible = setCards.slice(0, displayLimit);

  return (
    <div ref={wrapperRef}>
      <div className="section-head">
        <div><h2>Catalog</h2></div>
        <div className="meta">{setEntries.length} sets</div>
      </div>

      {setEntries.length > 0 && (
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

      {currentEntry && (
        <div className="catalog-bar">
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600 }}>{currentEntry.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 2 }}>
              {currentEntry.id} · {setCards.length} printed
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
          {loading ? (
            <LoadingSpinner />
          ) : setCards.length === 0 ? (
            <div className="empty">
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--ink-300)' }}>無</div>
              <h3>Nothing in this slice</h3>
              <p>{setEntries.length === 0 ? 'Run the scraper to populate the catalog.' : 'Adjust filters or pick another set.'}</p>
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
