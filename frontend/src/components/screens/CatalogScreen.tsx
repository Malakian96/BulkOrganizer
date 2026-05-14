import { useState, useEffect, useMemo } from 'react';
import { DesignCard, mapCatalogCard } from '../../mockData';
import { getCatalogCards, getCatalogSets } from '../../api/catalogApi';
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

interface SetInfo {
  id: string;
  name: string;
}

export function CatalogScreen({ search, collectionMap, wishlist, favorites, onCardClick, onToggleFav, onMarkOwned }: CatalogScreenProps) {
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [activeSet, setActiveSet] = useState('');
  const [allSetCards, setAllSetCards] = useState<DesignCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    domains: string[];
    rarities: string[];
    types: string[];
    costRange: [number, number];
    showMissing: boolean;
    showOwned: boolean;
  }>({ domains: [], rarities: [], types: [], costRange: [0, 12], showMissing: true, showOwned: true });
  const [limit, setLimit] = useState(80);

  useEffect(() => {
    void getCatalogSets().then(rawSets => {
      const infos = rawSets.map(s => ({ id: s, name: s }));
      setSets(infos);
      if (infos.length > 0) setActiveSet(infos[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeSet) return;
    setLoading(true);
    setLimit(80);
    void getCatalogCards({ set: activeSet, limit: 500 }).then(page => {
      const mapped = page.cards.map(c =>
        mapCatalogCard(c, collectionMap.get(c.cardId) ?? 0, wishlist, favorites)
      );
      setAllSetCards(mapped);
    }).finally(() => setLoading(false));
  }, [activeSet]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const setStats = useMemo(() => sets.map(s => {
    const owned = allSetCards.filter(c => (collectionMap.get(c.cardId) ?? 0) > 0).length;
    return { ...s, owned, total: allSetCards.length, pct: allSetCards.length ? owned / allSetCards.length : 0 };
  }), [sets, allSetCards, collectionMap]);

  const toggle = (key: 'domains' | 'rarities' | 'types', val: string) => {
    setFilters(f => {
      const cur = f[key];
      return { ...f, [key]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
    });
  };

  const currentSetInfo = sets.find(s => s.id === activeSet);
  const ownedInSet = setCards.filter(c => c.owned > 0).length;
  const missingInSet = setCards.length - ownedInSet;
  const visible = setCards.slice(0, limit);

  return (
    <>
      <div className="section-head">
        <div><h2>Catalog</h2></div>
        <div className="meta">{sets.length} sets</div>
      </div>

      {sets.length > 0 && (
        <div className="set-tabs">
          {setStats.map(s => (
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

      {currentSetInfo && (
        <div className="catalog-bar">
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600 }}>{currentSetInfo.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 2 }}>
              {currentSetInfo.id} · {setCards.length} printed
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
              <p>{sets.length === 0 ? 'Run the scraper to populate the catalog.' : 'Adjust filters or pick another set.'}</p>
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
              {setCards.length > limit && (
                <div style={{ textAlign: 'center', padding: '22px 0' }}>
                  <button className="btn" onClick={() => setLimit(l => l + 80)}>
                    Show {Math.min(80, setCards.length - limit)} more · {setCards.length - limit} remaining
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
