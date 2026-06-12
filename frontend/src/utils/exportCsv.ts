import { DesignCard } from '../mockData';

function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCollectionCsv(cards: DesignCard[]): void {
  const rows: (string | number)[][] = [
    ['Card ID', 'Name', 'Set', 'Rarity', 'Type', 'Quantity', 'Foil Quantity', 'Notes'],
    ...cards
      .filter((c) => c.owned > 0)
      .map((c) => [c.cardId, c.name, c.setName || c.set, c.rarity, c.type, c.owned, c.foilOwned, c.notes]),
  ];
  const csv = rows.map((r) => r.map(csvField).join(',')).join('\n');

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `rift-collection-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
