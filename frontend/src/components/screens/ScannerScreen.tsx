import { useState, useMemo, useRef } from 'react';
import { DesignCard, domainById } from '../../mockData';
import { petalBurst } from '../../utils/petals';

interface ScannerScreenProps {
  cards: DesignCard[];
  onIncrement: (card: DesignCard) => void;
}

export function ScannerScreen({ cards, onIncrement }: ScannerScreenProps) {
  const [feed, setFeed] = useState<Array<DesignCard & { _ts: number }>>([]);
  const [pulse, setPulse] = useState(false);
  const sample = useMemo(() => cards.slice(0, 80), [cards]);
  const idxRef = useRef(0);

  const snap = (e: React.MouseEvent<HTMLButtonElement>) => {
    setPulse(true);
    setTimeout(() => setPulse(false), 220);
    if (sample.length === 0) return;
    const card = sample[idxRef.current % sample.length];
    idxRef.current++;
    onIncrement(card);
    setFeed(f => [{ ...card, owned: card.owned + 1, _ts: Date.now() }, ...f].slice(0, 12));
    petalBurst(e.currentTarget, 8);
  };

  return (
    <>
      <div className="section-head">
        <div><h2>Scanner</h2></div>
        <div className="meta">{feed.length} added this session</div>
      </div>
      <div className="scanner-grid">
        <div
          className="scanner-view"
          style={pulse ? { boxShadow: 'inset 0 0 0 4px var(--vermillion)' } : {}}
        >
          <div className="scanner-frame" />
          <div className="scanner-hint">Place card inside frame · auto-detect 識別中</div>
          <button className="shutter" onClick={snap} aria-label="Capture" />
          <div style={{
            position: 'absolute', top: 14, left: 14,
            display: 'flex', gap: 8, alignItems: 'center',
            color: 'rgba(255,248,238,.6)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--vermillion)', boxShadow: '0 0 8px var(--vermillion)' }} />
            Live · 60 fps · 1080p
          </div>
        </div>
        <div className="recent">
          <div className="panel-head" style={{ marginTop: -2 }}>
            <h3>Recently scanned</h3>
            <span className="sub">tap shutter →</span>
          </div>
          {feed.length === 0 ? (
            <div className="empty" style={{ padding: '28px 18px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink-300)' }}>始</div>
              <h3 style={{ marginTop: 8 }}>Begin a session</h3>
              <p>Tap the shutter to log a card.</p>
            </div>
          ) : (
            <div className="recent-list">
              {feed.map((f) => {
                const d = domainById(f.domain);
                return (
                  <div className="recent-item" key={`${f.id}-${f._ts}`}>
                    <div className="th" style={{ background: `linear-gradient(160deg, ${d.color}33, var(--paper-3))` }} />
                    <div>
                      <div className="ttl">{f.name}</div>
                      <div className="sb">{f.set} · {f.type}</div>
                    </div>
                    <div className="stk">×{f.owned}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
