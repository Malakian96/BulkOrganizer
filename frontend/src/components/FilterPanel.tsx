import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { DOMAINS, RARITIES } from '../mockData';

const CARD_TYPES = ['Champion', 'Unit', 'Spell', 'Gear', 'Rune', 'Relic', 'Battlefield'];
export type Sort = 'recent' | 'name' | 'cost' | 'owned' | 'rarity';

function ChevronIcon() {
  return (
    <svg className="acc-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccordionSection({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={'fpanel-accordion' + (open ? ' open' : '')}>
      <div className="fpanel-accordion-hd" onClick={() => setOpen(o => !o)}>
        <span className="acc-label">{title}</span>
        <span className="acc-right">
          <span className="acc-val">{count > 0 ? `${count} selected` : 'All'}</span>
          <ChevronIcon />
        </span>
      </div>
      {open && <div className="fpanel-accordion-bd">{children}</div>}
    </div>
  );
}

function RangeSlider({ label, min, max, value, onChange }: {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const isAny = lo === min && hi === max;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const mid = (max - min) / 2 + min;
  const ticks = [min, Math.round(min + (max - min) * 0.25), Math.round(mid), Math.round(min + (max - min) * 0.75), max];

  return (
    <div className="fpanel-range">
      <div className="range-label-row">
        <span className="range-name">{label}</span>
        <span className="range-val">{isAny ? 'Any' : lo === hi ? String(lo) : `${lo}–${hi}`}</span>
      </div>
      <div className="range-track-wrap">
        <div className="range-track" />
        <div className="range-fill" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
        <input
          type="range" min={min} max={max} value={lo}
          className="range-input"
          style={{ zIndex: lo > mid ? 3 : 1 }}
          onChange={e => { const v = +e.target.value; onChange([Math.min(v, hi), hi]); }}
        />
        <input
          type="range" min={min} max={max} value={hi}
          className="range-input"
          style={{ zIndex: lo > mid ? 1 : 3 }}
          onChange={e => { const v = +e.target.value; onChange([lo, Math.max(v, lo)]); }}
        />
      </div>
      <div className="range-ticks">
        {ticks.map(v => <span key={v}>{v}</span>)}
      </div>
    </div>
  );
}

interface FilterPanelProps {
  selectedDomains: string[];
  onToggleDomain: (d: string) => void;
  selectedRarities: string[];
  onToggleRarity: (r: string) => void;
  selectedTypes?: string[];
  onToggleType?: (t: string) => void;
  costRange: [number, number];
  onCostRangeChange: (r: [number, number]) => void;
  sort?: Sort;
  onSortChange?: (s: Sort) => void;
  showOwned?: boolean;
  onToggleShowOwned?: () => void;
  showMissing?: boolean;
  onToggleShowMissing?: () => void;
}

export function FilterPanel({
  selectedDomains, onToggleDomain,
  selectedRarities, onToggleRarity,
  selectedTypes, onToggleType,
  costRange, onCostRangeChange,
  sort, onSortChange,
  showOwned, onToggleShowOwned,
  showMissing, onToggleShowMissing,
}: FilterPanelProps) {
  return (
    <aside className="fpanel">
      <div className="fpanel-label">Colors</div>
      <div className="fpanel-domains">
        {DOMAINS.map(d => (
          <button
            key={d.id}
            className={'domain-btn' + (selectedDomains.includes(d.id) ? ' on' : '')}
            style={{ '--domain-color': d.color, color: d.color } as CSSProperties}
            onClick={() => onToggleDomain(d.id)}
            title={d.name}
          >
            {d.glyph}
          </button>
        ))}
      </div>

      {onToggleType && (
        <AccordionSection title="Type" count={selectedTypes?.length ?? 0}>
          {CARD_TYPES.map(t => {
            const on = selectedTypes?.includes(t) ?? false;
            return (
              <div key={t} className={'fpanel-check-item' + (on ? ' on' : '')} onClick={() => onToggleType(t)}>
                <span className="fpanel-checkbox">{on && <CheckIcon />}</span>
                <span>{t}</span>
              </div>
            );
          })}
        </AccordionSection>
      )}

      <AccordionSection title="Rarity" count={selectedRarities.length}>
        {RARITIES.map(r => {
          const on = selectedRarities.includes(r.id);
          return (
            <div key={r.id} className={'fpanel-check-item' + (on ? ' on' : '')} onClick={() => onToggleRarity(r.id)}>
              <span className="fpanel-checkbox">{on && <CheckIcon />}</span>
              <span className="rarity-gem" style={{ background: r.color }} />
              <span style={{ textTransform: 'capitalize' }}>{r.id}</span>
            </div>
          );
        })}
      </AccordionSection>

      <RangeSlider label="Cost" min={0} max={12} value={costRange} onChange={onCostRangeChange} />

      {(onToggleShowOwned !== undefined || onToggleShowMissing !== undefined) && (
        <div className="fpanel-toggles">
          {onToggleShowOwned !== undefined && (
            <div className={'fpanel-toggle-item' + (showOwned ? ' on' : '')} onClick={onToggleShowOwned}>
              <span>Show Owned</span>
              <span className={'toggle-switch' + (showOwned ? ' on' : '')} />
            </div>
          )}
          {onToggleShowMissing !== undefined && (
            <div className={'fpanel-toggle-item' + (showMissing ? ' on' : '')} onClick={onToggleShowMissing}>
              <span>Show Missing</span>
              <span className={'toggle-switch' + (showMissing ? ' on' : '')} />
            </div>
          )}
        </div>
      )}

      {sort !== undefined && onSortChange && (
        <div className="fpanel-sort">
          <span className="fpanel-sort-label">Sort</span>
          <select value={sort} onChange={e => onSortChange(e.target.value as Sort)}>
            <option value="recent">Recent</option>
            <option value="name">Name A–Z</option>
            <option value="cost">Cost</option>
            <option value="owned">Owned</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
      )}
    </aside>
  );
}
