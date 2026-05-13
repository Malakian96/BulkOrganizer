import { CardDTO } from '../../types/card';
import { CardRow } from './CardRow';

interface CardTableProps {
  cards: CardDTO[];
  selectedIds: Set<string>;
  isAllSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export function CardTable({
  cards,
  selectedIds,
  isAllSelected,
  onToggleSelect,
  onToggleSelectAll,
}: CardTableProps) {
  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
        No cards yet. Add your first card to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Qty</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Tags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {cards.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              selected={selectedIds.has(card.id)}
              onToggle={onToggleSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
