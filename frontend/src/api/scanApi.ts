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

export interface ScanDebug {
  rawText: string;
  compressedText: string;
  matched: string | null;
  brightness: number;
  processedImageB64: string;
  setAbbr?: string;
  number?: string;
  reason: string;
}

export interface ScanResult {
  cardId: string | null;
  card: ScannedCard | null;
  debug?: ScanDebug;
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

// ── Socket.IO live scanner types ──────────────────────────────────────────

export interface CatalogCardResult {
  cardId: string;
  name: string;
  type: string;
  rarity: string;
  set: string;
  setAbbr: string;
  imageUrl: string;
  colors: string[];
  cost: number | null;
  power: number | null;
  might: number | null;
  supertype: string | null;
  effect: string;
  flavorText: string;
  tags: string[];
  hasFoil: boolean;
  promo: boolean;
  banned: boolean;
}

export interface LiveScanDebug {
  processedImageB64: string;
  brightness: number;
  query: string;
}

export interface LiveScanResult {
  candidates: CatalogCardResult[];
  ocrText: string;
  debug: LiveScanDebug;
}
