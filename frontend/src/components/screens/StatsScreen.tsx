import { useMemo } from 'react';
import { DesignCard, DOMAINS, RARITIES } from '../../mockData';

interface StatsScreenProps {
  cards: DesignCard[];
}

export function StatsScreen({ cards }: StatsScreenProps) {
  const stats = useMemo(() => {
    const total = cards.reduce((a, c) => a + c.owned, 0);
    const unique = cards.filter(c => c.owned > 0).length;
    const wishlist = cards.filter(c => c.wishlist).length;
    const fav = cards.filter(c => c.fav).length;

    const byDomain = DOMAINS.map(d => ({
      ...d,
      count: cards.filter(c => c.domain === d.id && c.owned > 0).reduce((a, c) => a + c.owned, 0),
    }));
    const maxDom = Math.max(1, ...byDomain.map(d => d.count));

    const byRarity = RARITIES.map(r => ({
      ...r,
      count: cards.filter(c => c.rarity === r.id && c.owned > 0).reduce((a, c) => a + c.owned, 0),
    }));
    const maxRar = Math.max(1, ...byRarity.map(r => r.count));

    // Group by set
    const setIds = [...new Set(cards.map(c => c.set))];
    const bySets = setIds.map(set => {
      const sc = cards.filter(c => c.set === set);
      const owned = sc.filter(c => c.owned > 0).length;
      return { id: set, name: sc[0]?.setName || set, owned, total: sc.length, pct: sc.length ? owned / sc.length : 0 };
    }).sort((a, b) => a.id.localeCompare(b.id));

    return { total, unique, wishlist, fav, byDomain, maxDom, byRarity, maxRar, bySets };
  }, [cards]);

  return (
    <>
      <div className="section-head">
        <div><h2>The Ledger</h2></div>
        <div className="meta">snapshot · today</div>
      </div>

      <div className="stat-grid">
        {[
          { label: 'Total cards', big: stats.total.toLocaleString(), delta: '+38 this week' },
          { label: 'Unique', big: stats.unique.toLocaleString(), delta: `${Math.round((stats.unique / Math.max(1, cards.length)) * 100)}% of printed` },
          { label: 'Wishlist', big: stats.wishlist, delta: 'open trades · 4', deltaStyle: { color: 'var(--ink-500)' } },
          { label: 'Favorited', big: stats.fav, delta: '★ keepers', deltaStyle: { color: 'var(--gold)' } },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="label">{s.label}</div>
            <div className="big">{s.big}</div>
            <div className="delta" style={s.deltaStyle}>{s.delta}</div>
            <div className="seal" />
          </div>
        ))}
      </div>

      <div className="stats-row-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="panel">
          <div className="panel-head"><h3>By domain</h3><span className="sub">owned</span></div>
          {stats.byDomain.map(d => (
            <div className="bar-row" key={d.id}>
              <div className="nm"><span className="dot" style={{ background: d.color }} />{d.name}</div>
              <div className="bar"><div className="fill" style={{ width: `${(d.count / stats.maxDom) * 100}%`, background: d.color }} /></div>
              <div className="v">{d.count}</div>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="panel-head"><h3>By rarity</h3><span className="sub">owned</span></div>
          {stats.byRarity.map(r => (
            <div className="bar-row" key={r.id}>
              <div className="nm"><span className="dot" style={{ background: r.color }} />{r.name}</div>
              <div className="bar"><div className="fill" style={{ width: `${(r.count / stats.maxRar) * 100}%`, background: r.color }} /></div>
              <div className="v">{r.count}</div>
            </div>
          ))}
        </div>
      </div>

      {stats.bySets.length > 0 && (
        <div className="panel">
          <div className="panel-head"><h3>Set completion</h3><span className="sub">unique cards</span></div>
          {stats.bySets.map(s => (
            <div className="bar-row" key={s.id} style={{ gridTemplateColumns: '180px 1fr 90px' }}>
              <div className="nm">
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-500)', letterSpacing: '.1em' }}>{s.id}</div>
                </div>
              </div>
              <div className="bar" style={{ height: 10 }}>
                <div className="fill" style={{ width: `${s.pct * 100}%`, background: 'linear-gradient(90deg, var(--vermillion), var(--gold))' }} />
              </div>
              <div className="v">{s.owned}/{s.total}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
