import { useState } from 'react';
import { CatalogCard } from '../../api/catalogApi';
import { useCatalog } from '../../hooks/useCatalog';
import { CatalogCardTile } from './CatalogCardTile';
import { CatalogCardDetail } from './CatalogCardDetail';
import { CatalogFilters } from './CatalogFilters';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function CatalogView() {
  const { cards, total, page, totalPages, loading, error, filter, sets, setFilter, goToPage } =
    useCatalog();
  const [selected, setSelected] = useState<CatalogCard | null>(null);

  return (
    <div>
      <CatalogFilters
        sets={sets}
        filter={filter}
        total={total}
        onFilterChange={setFilter}
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
          No cards found. Run the scraper to populate the catalog.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {cards.map((card) => (
              <CatalogCardTile key={card.cardId} card={card} onClick={setSelected} />
            ))}
          </div>

          {selected && (
            <CatalogCardDetail card={selected} onClose={() => setSelected(null)} />
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>

              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const p = totalPages <= 7
                  ? i + 1
                  : page <= 4
                    ? i + 1
                    : page >= totalPages - 3
                      ? totalPages - 6 + i
                      : page - 3 + i;
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      p === page
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
