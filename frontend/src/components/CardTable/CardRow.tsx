import { CardDTO } from '../../types/card';

interface CardRowProps {
  card: CardDTO;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function CardRow({ card, selected, onToggle }: CardRowProps) {
  return (
    <tr className={selected ? 'bg-indigo-50' : 'hover:bg-gray-50'}>
      <td className="w-10 px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(card.id)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </td>
      <td className="px-4 py-3 font-medium text-gray-900">{card.name}</td>
      <td className="px-4 py-3 text-gray-600">{card.description || '—'}</td>
      <td className="px-4 py-3 text-center text-gray-700">{card.quantity}</td>
      <td className="px-4 py-3 text-gray-600">{card.category || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}
