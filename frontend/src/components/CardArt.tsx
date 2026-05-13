import { domainById } from '../mockData';
import { DesignCard } from '../mockData';

interface CardArtProps {
  card: DesignCard;
  size?: 'normal' | 'mini' | 'big';
}

export function CardArt({ card, size }: CardArtProps) {
  const dom = domainById(card.domain);

  if (card.imageUrl) {
    return <img src={card.imageUrl} alt={card.name} className="art-img" loading="lazy" />;
  }

  const className = 'art-composed' + (size === 'mini' ? ' mini' : '') + (size === 'big' ? ' big' : '');

  return (
    <div
      className={className}
      style={{ background: `linear-gradient(160deg, ${dom.color}55, ${dom.color}22 55%, var(--paper-3))` }}
      aria-hidden="true"
    >
      <div
        className="art-glyph"
        style={size === 'mini' ? { color: dom.color, opacity: 0.55 } : undefined}
      >
        {dom.glyph}
      </div>
      {size !== 'mini' && (
        <div className="art-watermark">{dom.subtitle} · {card.set}</div>
      )}
    </div>
  );
}
