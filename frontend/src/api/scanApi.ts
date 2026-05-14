const BASE = import.meta.env.VITE_API_URL ?? '';

export interface ScannedCard {
  cardId: string;
  name: string;
  type: string;
  rarity: string;
  set: string;
  setAbbr: string;
  imageUrl: string;
  colors: string[];
  cost: number | null;
  effect: string;
  tags: string[];
}

export interface ScanResult {
  cardId: string | null;
  card: ScannedCard | null;
}

export async function scanCard(imageBase64: string): Promise<ScanResult> {
  const res = await fetch(`${BASE}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  });
  if (!res.ok) throw new Error(`Scan failed: ${res.status}`);
  return res.json() as Promise<ScanResult>;
}
