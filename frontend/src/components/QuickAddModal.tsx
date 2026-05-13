import { useState, useEffect, useRef } from 'react';
import { Icon } from './shared/Icon';
import { Stepper } from './shared/Stepper';
import { DOMAINS, RARITIES } from '../mockData';
import { CatalogCard, searchCatalog } from '../api/catalogApi';
import { CreateCardPayload } from '../types/card';
import { useDebounce } from '../hooks/useDebounce';

const TYPES = ['Unit', 'Spell', 'Rune', 'Gear', 'Champion'];

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCardPayload) => Promise<void>;
}

export function QuickAddModal({ open, onClose, onSubmit }: QuickAddModalProps) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('calm');
  const [rarity, setRarity] = useState('common');
  const [type, setType] = useState('Unit');
  const [cost, setCost] = useState(3);
  const [qty, setQty] = useState(1);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [suggestions, setSuggestions] = useState<CatalogCard[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedName = useDebounce(name, 280);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (!open || !debouncedName.trim()) { setSuggestions([]); return; }
    void searchCatalog(debouncedName).then((r) => { setSuggestions(r.slice(0, 8)); setShowSuggestions(r.length > 0); });
  }, [debouncedName, open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
      if (e.key === 'Enter' && open && document.activeElement?.tagName !== 'TEXTAREA') submit();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const applySuggestion = (card: CatalogCard) => {
    setName(card.name);
    setSelectedCardId(card.cardId);
    setRarity(card.rarity.toLowerCase());
    setType(card.type || 'Unit');
    if (card.cost != null) setCost(card.cost);
    setShowSuggestions(false);
  };

  const reset = () => {
    setName(''); setDomain('calm'); setRarity('common'); setType('Unit');
    setCost(3); setQty(1); setSelectedCardId(null); setSuggestions([]);
  };

  const submit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        cardId: selectedCardId ?? `manual-${Date.now()}`,
        name: name.trim(),
        colors: [domain],
        rarity,
        type,
        cost,
        quantity: qty,
      });
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={'modal-scrim' + (open ? ' on' : '')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" role="dialog">
        <div className="modal-head">
          <h2>Add to collection</h2>
          <button className="btn ghost sq" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ position: 'relative' }}>
            <label>Card name</label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => { setName(e.target.value); setSelectedCardId(null); setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Start typing to search the catalog…"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul style={{
                position: 'absolute', zIndex: 10, top: '100%', left: 0, right: 0, marginTop: 2,
                background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow)', listStyle: 'none', margin: 0, padding: 4, maxHeight: 220, overflowY: 'auto',
              }}>
                {suggestions.map(card => (
                  <li
                    key={card.cardId}
                    onMouseDown={() => applySuggestion(card)}
                    style={{
                      padding: '7px 10px', cursor: 'default', borderRadius: 4, fontSize: 13,
                      display: 'flex', justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--card-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>{card.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)' }}>{card.setAbbr}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="field-row">
            <div className="field">
              <label>Domain</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name} · {d.subtitle}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Rarity</label>
              <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
                {RARITIES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 4 }}>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-500)', display: 'block', marginBottom: 6 }}>Cost</label>
              <Stepper value={cost} onChange={setCost} min={0} max={12} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-500)', display: 'block', marginBottom: 6 }}>Quantity</label>
              <Stepper value={qty} onChange={setQty} min={1} max={20} />
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)', letterSpacing: '.12em', textTransform: 'uppercase' }}>Adding</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>×{qty}</div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => void submit()} disabled={!name.trim() || submitting}>
            <Icon name="plus" size={14} /> Add to collection
          </button>
        </div>
      </div>
    </div>
  );
}
