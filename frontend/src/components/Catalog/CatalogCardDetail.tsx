import { CatalogCard } from '../../api/catalogApi';

function decodeHtmlEntities(html: string): string {
  const ta = document.createElement('textarea');
  ta.innerHTML = html;
  return ta.value;
}

const RARITY_COLOR: Record<string, string> = {
  Common: 'bg-gray-100 text-gray-600',
  Uncommon: 'bg-green-100 text-green-700',
  Rare: 'bg-blue-100 text-blue-700',
  Legendary: 'bg-yellow-100 text-yellow-700',
};

interface Props {
  card: CatalogCard;
  onClose: () => void;
}

export function CatalogCardDetail({ card, onClose }: Props) {
  const rarityClass = RARITY_COLOR[card.rarity] ?? 'bg-gray-100 text-gray-600';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80"
        >
          ✕
        </button>

        {/* Card image */}
        <div className="flex w-full shrink-0 items-center justify-center bg-gray-800 sm:w-64">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="h-full w-full object-cover sm:h-auto sm:rounded-l-2xl"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center text-gray-600">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 text-white">
          {/* Name + supertype */}
          <div>
            {card.supertype && (
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400">{card.supertype}</p>
            )}
            <h2 className="text-2xl font-bold leading-tight">{card.name}</h2>
          </div>

          {/* Stat badges */}
          <div className="flex flex-wrap gap-2">
            {card.cost !== null && (
              <span className="flex items-center gap-1 rounded-full bg-gray-700 px-3 py-1 text-sm font-semibold">
                <span className="text-gray-400">Energy</span> {card.cost}
              </span>
            )}
            {card.power !== null && (
              <span className="flex items-center gap-1 rounded-full bg-purple-900/60 px-3 py-1 text-sm font-semibold text-purple-300">
                ✦ Power {card.power}
              </span>
            )}
            {card.might !== null && (
              <span className="flex items-center gap-1 rounded-full bg-orange-900/60 px-3 py-1 text-sm font-semibold text-orange-300">
                ⚔ Might {card.might}
              </span>
            )}
          </div>

          {/* Type + Rarity + Set */}
          <div className="flex flex-wrap gap-2">
            {card.type && (
              <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">{card.type}</span>
            )}
            {card.rarity && (
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${rarityClass}`}>{card.rarity}</span>
            )}
            {card.set && (
              <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">{card.set}</span>
            )}
            {card.banned && (
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold">BANNED</span>
            )}
          </div>

          {/* Colors */}
          {card.colors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.colors.map((c) => (
                <span key={c} className="rounded-full bg-indigo-900/60 px-2 py-0.5 text-xs text-indigo-300">{c}</span>
              ))}
            </div>
          )}

          {/* Effect */}
          {card.effect && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Effect</p>
              <div
                className="text-sm leading-relaxed text-gray-200 [&_img]:inline [&_img]:h-4 [&_img]:w-4"
                dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(card.effect) }}
              />
            </div>
          )}

          {/* Flavor text */}
          {card.flavorText && (
            <p className="border-l-2 border-gray-600 pl-3 text-sm italic text-gray-400">"{card.flavorText}"</p>
          )}

          {/* Tags */}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.map((t) => (
                <span key={t} className="rounded-full bg-gray-700/60 px-2 py-0.5 text-xs text-gray-400">{t}</span>
              ))}
            </div>
          )}

          {/* Card ID */}
          <p className="mt-auto text-xs text-gray-600">{card.cardId}</p>
        </div>
      </div>
    </div>
  );
}
