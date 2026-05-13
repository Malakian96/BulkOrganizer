import { CatalogCard } from '../../api/catalogApi';

const RARITY_COLOR: Record<string, string> = {
  Common: 'bg-gray-100 text-gray-600',
  Uncommon: 'bg-green-100 text-green-700',
  Rare: 'bg-blue-100 text-blue-700',
  Legendary: 'bg-yellow-100 text-yellow-700',
};

interface Props {
  card: CatalogCard;
}

export function CatalogCardTile({ card }: Props) {
  const rarityClass = RARITY_COLOR[card.rarity] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Card image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Cost badge */}
        {card.cost !== null && (
          <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900/80 text-xs font-bold text-white">
            {card.cost}
          </span>
        )}
        {card.banned && (
          <span className="absolute right-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
            BANNED
          </span>
        )}
      </div>

      {/* Card info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-sm font-semibold leading-tight text-gray-900">{card.name}</h3>
          {card.might !== null && (
            <span className="shrink-0 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-bold text-orange-700">
              ⚔ {card.might}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {card.type && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{card.type}</span>
          )}
          {card.rarity && (
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${rarityClass}`}>{card.rarity}</span>
          )}
        </div>

        {card.colors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.colors.map((c) => (
              <span key={c} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">{c}</span>
            ))}
          </div>
        )}

        {card.effect && (
          <p
            className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-500"
            dangerouslySetInnerHTML={{ __html: card.effect }}
          />
        )}

        {card.flavorText && (
          <p className="mt-auto line-clamp-2 text-xs italic text-gray-400">"{card.flavorText}"</p>
        )}

        <div className="mt-1 flex flex-wrap gap-1">
          {card.tags.map((t) => (
            <span key={t} className="rounded-full bg-gray-50 px-1.5 py-0.5 text-xs text-gray-400">{t}</span>
          ))}
        </div>

        {card.set && (
          <p className="mt-1 text-xs text-gray-400">{card.set}</p>
        )}
      </div>
    </div>
  );
}
