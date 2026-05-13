import { CatalogCard } from '../../api/catalogApi';

interface Props {
  card: CatalogCard;
  onClick: (card: CatalogCard) => void;
}

export function CatalogCardTile({ card, onClick }: Props) {
  return (
    <button
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-200 shadow-sm transition hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      onClick={() => onClick(card)}
      title={card.name}
    >
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={card.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Name tooltip on hover */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/80 px-2 py-1.5 text-center text-xs font-medium text-white transition group-hover:translate-y-0">
        {card.name}
      </div>
    </button>
  );
}
