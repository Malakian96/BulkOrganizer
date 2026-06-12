import type { CatalogCard } from './catalogApi';

// ── Socket.IO live scanner types ──────────────────────────────────────────

// Scan candidates carry full catalog card data
export type CatalogCardResult = CatalogCard;

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
