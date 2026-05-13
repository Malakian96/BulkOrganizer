import { DesignCard, domainById, rarityById } from '../mockData';
import { CardArt } from './CardArt';
import { Icon } from './shared/Icon';

interface TRowProps {
  card: DesignCard;
  selected?: boolean;
  onClick: (card: DesignCard) => void;
  onSelect?: (id: string) => void;
  onToggleFav?: (card: DesignCard, el: Element) => void;
}

export function TRow({ card, selected, onClick, onSelect, onToggleFav }: TRowProps) {
  const dom = domainById(card.domain);
  const rar = rarityById(card.rarity);

  return (
    <div
      className={'list-row' + (selected ? ' selected' : '')}
      onClick={() => onClick(card)}
    >
      <div
        className="list-checkbox"
        onClick={(e) => { e.stopPropagation(); onSelect?.(card.id); }}
      >
        <Icon name="check" size={12} />
      </div>
      <div className="thumb">
        <CardArt card={card} size="mini" />
      </div>
      <div>
        <div className="nm">{card.name}</div>
        <div className="nm-sub">{card.set}{card.num ? ` · ${card.num}` : ''}</div>
      </div>
      <div>
        <span className="pill"><span className="dot" style={{ background: dom.color }} /> {dom.name}</span>
      </div>
      <div>
        <span className="pill"><span className="dot" style={{ background: rar.color }} /> {rar.name}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{card.type}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        {card.cost != null && (
          <span style={{
            display: 'inline-grid', placeItems: 'center',
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--ink-900)', color: 'var(--paper)', fontWeight: 600,
          }}>{card.cost}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>×{card.owned}</span>
        <button
          className="btn ghost sq"
          onClick={(e) => { e.stopPropagation(); onToggleFav?.(card, e.currentTarget); }}
          style={{ padding: 4 }}
          aria-label="Favorite"
        >
          <Icon name={card.fav ? 'heartF' : 'heart'} size={14} />
        </button>
      </div>
    </div>
  );
}
