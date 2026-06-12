import { useState, useEffect, useRef } from 'react';
import { Icon } from './shared/Icon';
import { Stepper } from './shared/Stepper';
import { CatalogCard, searchCatalog } from '../api/catalogApi';
import { useDebounce } from '../hooks/useDebounce';

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (card: CatalogCard, quantity: number) => Promise<void>;
}

export function QuickAddModal({ open, onClose, onSubmit }: QuickAddModalProps) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedCard, setSelectedCard] = useState<CatalogCard | null>(null);
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
      if (e.key === 'Enter' && open) submit();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const applySuggestion = (card: CatalogCard) => {
    setName(card.name);
    setSelectedCard(card);
    setShowSuggestions(false);
  };

  const reset = () => {
    setName(''); setQty(1); setSelectedCard(null); setSuggestions([]);
  };

  const submit = async () => {
    if (!selectedCard || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(selectedCard, qty);
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
          <h2>Add from catalog</h2>
          <button className="btn ghost sq" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ position: 'relative' }}>
            <label>Card name</label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => { setName(e.target.value); setSelectedCard(null); setShowSuggestions(true); }}
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
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)' }}>{card.cardId}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedCard ? (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 12, border: '1px solid var(--rule)', borderRadius: 'var(--radius-sm)', background: 'var(--card-2)' }}>
              {selectedCard.imageUrl && (
                <img
                  src={selectedCard.imageUrl}
                  alt={selectedCard.name}
                  style={{ width: 58, borderRadius: 4, flexShrink: 0 }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 15 }}>{selectedCard.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 3 }}>
                  {selectedCard.cardId} · {selectedCard.set}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 3, textTransform: 'capitalize' }}>
                  {selectedCard.type}{selectedCard.rarity ? ` · ${selectedCard.rarity}` : ''}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '18px 12px', textAlign: 'center', color: 'var(--ink-500)', fontSize: 13, border: '1px dashed var(--rule)', borderRadius: 'var(--radius-sm)' }}>
              Pick a card from the catalog to add it to your collection.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 4 }}>
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
          <button className="btn primary" onClick={() => void submit()} disabled={!selectedCard || submitting}>
            <Icon name="plus" size={14} /> Add to collection
          </button>
        </div>
      </div>
    </div>
  );
}
