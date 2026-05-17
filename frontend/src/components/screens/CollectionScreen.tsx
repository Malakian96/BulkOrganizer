import { useState, useMemo } from 'react';
import { DesignCard, RARITIES } from '../../mockData';
import { TCard } from '../TCard';
import { TRow } from '../TRow';
import { FilterPanel, Sort } from '../FilterPanel';
import { petalBurst } from '../../utils/petals';

interface CollectionScreenProps {
  cards: DesignCard[];
  view: 'grid' | 'list';
  search: string;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  onCardClick: (card: DesignCard) => void;
  onToggleFav: (card: DesignCard, el: Element) => void;
}

export function CollectionScreen({ cards, view, search, selected, setSelected, onCardClick, onToggleFav }: CollectionScreenProps) {
  const [filters, setFilters] = useState<{
    domains: string[];
    rarities: string[];
    costRange: [number, number];
    sort: Sort;
  }>({ domains: [], rarities: [], costRange: [0, 12], sort: 'recent' });
  const [limit, setLimit] = useState(120);

  const toggle = (key: 'domains' | 'rarities', val: string) => {
    setFilters(f => {
      const cur = f[key];
      return { ...f, [key]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] };
    });
  };

  const onSelect = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const filtered = useMemo(() => {
    let r = cards.filter(c => c.owned > 0);
    const q = search.trim().toLowerCase();
    if (q) r = r.filter(c => c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q));
    if (filters.domains.length) r = r.filter(c => filters.domains.includes(c.domain));
    if (filters.rarities.length) r = r.filter(c => filters.rarities.includes(c.rarity));
    const [lo, hi] = filters.costRange;
    if (lo > 0 || hi < 12) r = r.filter(c => { const cost = c.cost ?? 0; return cost >= lo && cost <= hi; });
    const RARITY_ORDER = RARITIES.map(r => r.id);
    const sortFns: Record<Sort, (a: DesignCard, b: DesignCard) => number> = {
      recent: (a, b) => b.dateAdded - a.dateAdded,
      name:   (a, b) => a.name.localeCompare(b.name),
      cost:   (a, b) => (a.cost ?? 0) - (b.cost ?? 0),
      owned:  (a, b) => b.owned - a.owned,
      rarity: (a, b) => RARITY_ORDER.indexOf(b.rarity as typeof RARITY_ORDER[number]) - RARITY_ORDER.indexOf(a.rarity as typeof RARITY_ORDER[number]),
    };
    return [...r].sort(sortFns[filters.sort]);
  }, [cards, search, filters]);

  const visible = filtered.slice(0, limit);

  return (
    <>
      <div className="section-head">
        <div><h2>My Collection</h2></div>
        <div className="meta">{filtered.length.toLocaleString()} cards</div>
      </div>

      <div className="screen-layout">
        <FilterPanel
          selectedDomains={filters.domains}
          onToggleDomain={d => toggle('domains', d)}
          selectedRarities={filters.rarities}
          onToggleRarity={r => toggle('rarities', r)}
          costRange={filters.costRange}
          onCostRangeChange={r => setFilters(f => ({ ...f, costRange: r }))}
          sort={filters.sort}
          onSortChange={s => setFilters(f => ({ ...f, sort: s }))}
        />

        <div className="screen-main">
          {filtered.length === 0 && (
            <div className="empty">
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--ink-300)' }}>無</div>
              <h3>Nothing found</h3>
              <p>Clear a filter or try a different search.</p>
            </div>
          )}

          {view === 'grid' && filtered.length > 0 && (
            <div className="card-grid">
              {visible.map(c => (
                <TCard
                  key={c.id} card={c}
                  selected={selected.includes(c.id)}
                  onClick={onCardClick}
                  onSelect={onSelect}
                  onToggleFav={(card, el) => { onToggleFav(card, el); petalBurst(el, 4); }}
                />
              ))}
            </div>
          )}

          {view === 'list' && filtered.length > 0 && (
            <div className="list">
              <div className="list-head">
                <div /><div />
                <div>Name</div>
                <div>Domain</div>
                <div>Rarity</div>
                <div>Type</div>
                <div>Cost</div>
                <div style={{ textAlign: 'right' }}>Owned</div>
              </div>
              {visible.map(c => (
                <TRow
                  key={c.id} card={c}
                  selected={selected.includes(c.id)}
                  onClick={onCardClick}
                  onSelect={onSelect}
                  onToggleFav={(card, el) => { onToggleFav(card, el); petalBurst(el, 4); }}
                />
              ))}
            </div>
          )}

          {filtered.length > limit && (
            <div style={{ textAlign: 'center', padding: '22px 0' }}>
              <button className="btn" onClick={() => setLimit(l => l + 120)}>
                Show {Math.min(120, filtered.length - limit)} more · {filtered.length - limit} remaining
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
