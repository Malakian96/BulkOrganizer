import { useEffect, useState } from 'react';
import { CatalogFilter } from '../../api/catalogApi';
import { useDebounce } from '../../hooks/useDebounce';

interface Props {
  sets: string[];
  filter: CatalogFilter;
  total: number;
  onFilterChange: (f: Partial<CatalogFilter>) => void;
}

const TYPES = ['Champion', 'Unit', 'Spell', 'Gear', 'Terrain'];
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Legendary'];

export function CatalogFilters({ sets, filter, total, onFilterChange }: Props) {
  const [nameInput, setNameInput] = useState(filter.name ?? '');
  const debouncedName = useDebounce(nameInput, 350);

  useEffect(() => {
    onFilterChange({ name: debouncedName || undefined });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-48">
        <label className="mb-1 block text-xs font-medium text-gray-600">Search name</label>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Filter by name…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Set</label>
        <select
          value={filter.set ?? ''}
          onChange={(e) => onFilterChange({ set: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Sets</option>
          {sets.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
        <select
          value={filter.type ?? ''}
          onChange={(e) => onFilterChange({ type: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Rarity</label>
        <select
          value={filter.rarity ?? ''}
          onChange={(e) => onFilterChange({ rarity: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Rarities</option>
          {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <p className="ml-auto text-sm text-gray-400">{total} cards</p>
    </div>
  );
}
