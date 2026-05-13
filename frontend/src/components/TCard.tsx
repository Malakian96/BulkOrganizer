import { DesignCard, domainById, rarityById } from '../mockData';
import { CardArt } from './CardArt';
import { Icon } from './shared/Icon';
import { petalBurst } from '../utils/petals';

interface TCardProps {
  card: DesignCard;
  selected?: boolean;
  missing?: boolean;
  onClick: (card: DesignCard) => void;
  onSelect?: (id: string) => void;
  onToggleFav?: (card: DesignCard, el: Element) => void;
  onMarkOwned?: (card: DesignCard, el: Element) => void;
}

export function TCard({ card, selected, missing, onClick, onSelect, onToggleFav, onMarkOwned }: TCardProps) {
  const dom = domainById(card.domain);
  const rar = rarityById(card.rarity);

  return (
    <div
      className={'tcard' + (selected ? ' selected' : '') + (missing ? ' missing' : '')}
      onClick={() => onClick(card)}
    >
      {onSelect && (
        <button
          className="check"
          onClick={(e) => { e.stopPropagation(); onSelect(card.id); }}
          aria-label="Select"
        >
          <Icon name="check" size={14} />
        </button>
      )}
      {card.cost != null && <div className="cost">{card.cost}</div>}
      <div className="domain-stripe" style={{ background: dom.color }} />
      <button
        className={'fav' + (card.fav ? ' on' : '')}
        onClick={(e) => { e.stopPropagation(); onToggleFav?.(card, e.currentTarget); }}
        aria-label="Favorite"
      >
        <Icon name={card.fav ? 'heartF' : 'heart'} size={13} />
      </button>
      <div className="art">
        <CardArt card={card} />
        {missing && <div className="art-missing-tag">Missing</div>}
        {missing && onMarkOwned && (
          <div
            className="add-owned"
            onClick={(e) => { e.stopPropagation(); onMarkOwned(card, e.currentTarget); petalBurst(e.currentTarget, 7); }}
          >
            <span className="pillbtn"><Icon name="plus" size={13} /> I own this</span>
          </div>
        )}
      </div>
      {card.owned > 1 && !missing && <div className="qty">×{card.owned}</div>}
      <div className="meta">
        <div className="name">{card.name}</div>
        <div className="submeta">
          <span className="rarity-dot" style={{ background: rar.color }} />
          <span>{rar.name}</span>
          {card.num && (
            <>
              <span style={{ opacity: 0.4, padding: '0 4px' }}>·</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>{card.num}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
