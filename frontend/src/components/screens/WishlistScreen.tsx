import { DesignCard } from '../../mockData';
import { TCard } from '../TCard';
import { petalBurst } from '../../utils/petals';

interface WishlistScreenProps {
  cards: DesignCard[];
  onCardClick: (card: DesignCard) => void;
  onToggleFav: (card: DesignCard, el: Element) => void;
}

export function WishlistScreen({ cards, onCardClick, onToggleFav }: WishlistScreenProps) {
  const list = cards.filter(c => c.wishlist);

  return (
    <>
      <div className="section-head">
        <div><h2>Wishlist</h2></div>
        <div className="meta">{list.length} cards · trade or hunt</div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--ink-300)' }}>空</div>
          <h3>The wishlist is empty</h3>
          <p>Mark cards you want from the card drawer or catalog.</p>
        </div>
      ) : (
        <div className="card-grid">
          {list.slice(0, 60).map(c => (
            <TCard
              key={c.id} card={c}
              selected={false}
              onClick={onCardClick}
              onToggleFav={(card, el) => { onToggleFav(card, el); petalBurst(el, 4); }}
            />
          ))}
        </div>
      )}
    </>
  );
}
