import { useState, useEffect } from 'react';
import { DesignCard, domainById, rarityById } from '../mockData';
import { CardArt } from './CardArt';
import { Icon } from './shared/Icon';
import { Stepper } from './shared/Stepper';
import { petalBurst } from '../utils/petals';
import { decodeHtmlEntities } from '../utils/html';

interface CardDrawerProps {
  card: DesignCard | null;
  onClose: () => void;
  onUpdate: (
    card: DesignCard,
    patch: { owned?: number; foilOwned?: number; notes?: string; wishlist?: boolean; fav?: boolean },
  ) => void;
}

export function CardDrawer({ card, onClose, onUpdate }: CardDrawerProps) {
  const open = !!card;
  const [last, setLast] = useState<DesignCard | null>(card);
  useEffect(() => { if (card) setLast(card); }, [card]);
  const c = card ?? last;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && card) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [card, onClose]);

  if (!c) return null;

  const dom = domainById(c.domain);
  const rar = rarityById(c.rarity);

  return (
    <>
      <div className={'drawer-scrim' + (open ? ' on' : '')} onClick={onClose} />
      <div className={'drawer' + (open ? ' on' : '')}>
        <div className="drawer-head">
          <button className="btn ghost sq" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
          <div style={{ marginLeft: 4, flex: 1, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
            {c.set}{c.num ? ` · ${c.num}` : ''}
          </div>
          <button
            className="btn ghost sq"
            onClick={(e) => { onUpdate(c, { fav: !c.fav }); if (!c.fav) petalBurst(e.currentTarget, 6); }}
            aria-label="Favorite"
          >
            <Icon name={c.fav ? 'heartF' : 'heart'} />
          </button>
        </div>
        <div className="drawer-body">
          <div className="drawer-card">
            <CardArt card={c} size="big" />
          </div>
          <div className="drawer-title">{c.name}</div>
          <div className="drawer-sub">{c.setName} · {dom.name} · {c.type}</div>

          <div className="kv-grid">
            <div className="kv">
              <span className="k">Domain</span>
              <span className="v" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: dom.color }} />
                {dom.name}
                <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-500)', fontSize: 13 }}>· {dom.glyph}</span>
              </span>
            </div>
            <div className="kv">
              <span className="k">Rarity</span>
              <span className="v" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: rar.color }} />
                {rar.name}
              </span>
            </div>
            {c.cost != null && <div className="kv"><span className="k">Cost</span><span className="v">{c.cost}</span></div>}
            <div className="kv"><span className="k">Type</span><span className="v">{c.type}</span></div>
            {c.might != null && <div className="kv"><span className="k">Might / Power</span><span className="v">{c.might}{c.power != null ? ` / ${c.power}` : ''}</span></div>}
            <div className="kv"><span className="k">Set</span><span className="v" style={{ fontSize: 13 }}>{c.setName || c.set}</span></div>
          </div>

          <div className="hr" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div className="kv-grid" style={{ marginTop: 0 }}>
              <div className="kv" style={{ padding: '8px 10px' }}>
                <span className="k">Owned</span>
                <span className="v" style={{ fontSize: 18 }}>{c.owned}</span>
              </div>
            </div>
            <Stepper
              value={c.owned}
              onChange={(v) => onUpdate(c, { owned: v, wishlist: v === 0 ? c.wishlist : false })}
            />
          </div>

          {c.owned > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 10 }}>
                <div className="kv-grid" style={{ marginTop: 0 }}>
                  <div className="kv" style={{ padding: '8px 10px' }}>
                    <span className="k">Foil</span>
                    <span className="v" style={{ fontSize: 18 }}>{c.foilOwned}</span>
                  </div>
                </div>
                <Stepper
                  value={c.foilOwned}
                  onChange={(v) => onUpdate(c, { foilOwned: v })}
                />
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
                <textarea
                  key={c.id}
                  defaultValue={c.notes}
                  placeholder="Condition, trades, where it lives…"
                  rows={2}
                  style={{
                    width: '100%', resize: 'vertical', fontSize: 13, lineHeight: 1.5,
                    padding: '8px 10px', border: '1px solid var(--rule)', borderRadius: 'var(--radius-sm)',
                    background: 'var(--paper)', color: 'var(--ink-700)', fontFamily: 'inherit',
                  }}
                  onBlur={(e) => { if (e.target.value !== c.notes) onUpdate(c, { notes: e.target.value }); }}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              className="btn"
              onClick={(e) => { onUpdate(c, { wishlist: !c.wishlist }); if (!c.wishlist) petalBurst(e.currentTarget, 5); }}
              style={c.wishlist ? { borderColor: 'var(--vermillion)', color: 'var(--vermillion)' } : {}}
            >
              <Icon name="flag" size={14} /> {c.wishlist ? 'On wishlist' : 'Add to wishlist'}
            </button>
          </div>

          {c.effect && (
            <>
              <div className="hr" />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-500)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>Effect</div>
              <div style={{ fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.55 }}>
                {decodeHtmlEntities(c.effect)}
              </div>
            </>
          )}

          {c.flavorText && (
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-500)', marginTop: 10 }}>
              "{c.flavorText}"
            </div>
          )}
        </div>
      </div>
    </>
  );
}
