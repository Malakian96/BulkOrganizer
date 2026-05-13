import { MOCK_DECKS, domainById } from '../../mockData';
import { Chip } from '../shared/Chip';

export function DecksScreen() {
  return (
    <>
      <div className="section-head">
        <div><h2>Decks</h2></div>
        <div className="meta">{MOCK_DECKS.length} built · 1 draft</div>
      </div>
      <div className="deck-grid">
        {MOCK_DECKS.map(d => {
          const doms = d.domains.map(x => domainById(x));
          return (
            <div className="deck-card" key={d.id}>
              <div className="deck-fan">
                {Array.from({ length: 5 }).map((_, i) => {
                  const dom = doms[i % doms.length];
                  return (
                    <div
                      key={i}
                      className="mini"
                      style={{
                        transform: `rotate(${(i - 2) * 8}deg) translateY(${Math.abs(i - 2) * 2}px)`,
                        background: `linear-gradient(160deg, ${dom.color}55, var(--paper-2))`,
                      }}
                    />
                  );
                })}
              </div>
              <div className="deck-meta">
                <div className="deck-name">{d.name}</div>
                <div className="deck-fmt">{d.format}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {doms.map(dd => (
                  <Chip key={dd.id} dot={dd.color}>{dd.name}</Chip>
                ))}
              </div>
              <div className="deck-stats">
                <span>{d.cards} cards</span>
                <span>·</span>
                <span>WR {Math.round(d.winRate * 100)}%</span>
                <span>·</span>
                <span>{d.lastPlayed}</span>
              </div>
            </div>
          );
        })}
        <button className="deck-card add">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink-300)', marginBottom: 6 }}>新</div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>New deck</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Start blank</div>
          </div>
        </button>
      </div>
    </>
  );
}
