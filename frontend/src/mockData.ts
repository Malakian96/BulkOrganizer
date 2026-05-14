import { CardDTO } from './types/card';
import { CatalogCard } from './api/catalogApi';

// ── Design tokens (mirrors styles.css domain/rarity variables) ──────────
export const DOMAINS = [
  { id: 'body',  name: 'Body',  color: '#c07828', glyph: '土', subtitle: 'Earth' },
  { id: 'mind',  name: 'Mind',  color: '#3a6a9c', glyph: '水', subtitle: 'Water' },
  { id: 'calm',  name: 'Calm',  color: '#4a7a55', glyph: '風', subtitle: 'Wind' },
  { id: 'chaos', name: 'Chaos', color: '#7c3a92', glyph: '炎', subtitle: 'Fire' },
  { id: 'order', name: 'Order', color: '#b8a030', glyph: '光', subtitle: 'Light' },
  { id: 'fury',  name: 'Fury',  color: '#c4322a', glyph: '雷', subtitle: 'Thunder' },
] as const;

export const RARITIES = [
  { id: 'common',    name: 'Common',    color: '#6b5d52' },
  { id: 'uncommon',  name: 'Uncommon',  color: '#4a6b8c' },
  { id: 'rare',      name: 'Rare',      color: '#8b6b2a' },
  { id: 'epic',      name: 'Epic',      color: '#6b3a8c' },
  { id: 'legendary', name: 'Legendary', color: '#c4322a' },
] as const;

export const MOCK_DECKS = [
  { id: 'd1', name: 'Reed Pilgrim Mid',  format: 'Standard', domains: ['calm', 'body'],  cards: 42, winRate: 0.62, lastPlayed: '2 days ago' },
  { id: 'd2', name: 'Hollow Tide Burn',  format: 'Standard', domains: ['chaos', 'fury'], cards: 40, winRate: 0.54, lastPlayed: '5 days ago' },
  { id: 'd3', name: 'Lantern Control',   format: 'Standard', domains: ['mind', 'order'], cards: 44, winRate: 0.71, lastPlayed: 'today' },
  { id: 'd4', name: 'Two Rivers Aggro',  format: 'Open',     domains: ['body', 'fury'],  cards: 40, winRate: 0.49, lastPlayed: '1 week ago' },
  { id: 'd5', name: 'Quiet Mountain',    format: 'Standard', domains: ['calm', 'order'], cards: 42, winRate: 0.66, lastPlayed: '3 days ago' },
];

// ── DesignCard — unified card format for all UI components ──────────────
export interface DesignCard {
  id: string;
  cardId: string;
  name: string;
  domain: string;
  rarity: string;
  type: string;
  set: string;
  setName: string;
  cost: number | null;
  might: number | null;
  power: number | null;
  owned: number;
  wishlist: boolean;
  fav: boolean;
  dateAdded: number;
  imageUrl?: string;
  num?: string;
  effect?: string;
  flavorText?: string;
  tags?: string[];
  sourceType: 'collection' | 'catalog' | 'mock';
}

// ── Color → domain mapping ──────────────────────────────────────────────
const COLOR_DOMAIN: Record<string, string> = {
  // Explicit domain IDs pass through
  body: 'body', mind: 'mind', calm: 'calm', chaos: 'chaos', order: 'order', fury: 'fury',
  // Body (Orange) — physical strength
  orange: 'body', amber: 'body', brown: 'body', earth: 'body', tan: 'body',
  // Mind (Blue) — intelligence, water
  blue: 'mind', water: 'mind', ocean: 'mind', navy: 'mind', azure: 'mind', indigo: 'mind',
  // Calm (Green) — balance, nature, wind
  green: 'calm', nature: 'calm', forest: 'calm', grass: 'calm', jade: 'calm',
  gray: 'calm', grey: 'calm', wind: 'calm', air: 'calm', cyan: 'calm', silver: 'calm',
  // Chaos (Purple) — unpredictability
  purple: 'chaos', violet: 'chaos', magenta: 'chaos', storm: 'chaos', thunder: 'chaos',
  // Order (Yellow) — unity, light
  gold: 'order', yellow: 'order', white: 'order', light: 'order', sun: 'order',
  // Fury (Red) — aggression, fire
  red: 'fury', fire: 'fury', crimson: 'fury', scarlet: 'fury',
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function colorsToDomain(colors: string[]): string {
  const first = (colors[0] ?? '').toLowerCase().trim();
  return COLOR_DOMAIN[first] ?? DOMAINS[hashStr(first) % DOMAINS.length].id;
}

export function normalizeRarity(r: string): string {
  const lower = r.toLowerCase();
  return RARITIES.find(x => x.id === lower) ? lower : 'common';
}

export function domainById(id: string) {
  return DOMAINS.find(d => d.id === id) ?? DOMAINS[2];
}

export function rarityById(id: string) {
  return RARITIES.find(r => r.id === id) ?? RARITIES[0];
}

// ── Mappers ─────────────────────────────────────────────────────────────
export function mapCardDTO(
  card: CardDTO,
  wishlist: Set<string>,
  favorites: Set<string>,
): DesignCard {
  return {
    id: card.id,
    cardId: card.cardId,
    name: card.name,
    domain: colorsToDomain(card.colors ?? []),
    rarity: normalizeRarity(card.rarity ?? 'common'),
    type: card.type || 'Unit',
    set: card.set ?? '',
    setName: card.set ?? '',
    cost: card.cost ?? null,
    might: card.might ?? null,
    power: null,
    owned: card.quantity ?? 0,
    wishlist: wishlist.has(card.cardId),
    fav: favorites.has(card.cardId),
    dateAdded: card.createdAt ? new Date(card.createdAt).getTime() : Date.now(),
    imageUrl: card.imageUrl || undefined,
    effect: card.effect || undefined,
    flavorText: card.flavorText || undefined,
    tags: card.tags ?? [],
    sourceType: 'collection',
  };
}

export function mapCatalogCard(
  card: CatalogCard,
  ownedQty: number,
  wishlist: Set<string>,
  favorites: Set<string>,
): DesignCard {
  return {
    id: card.cardId,
    cardId: card.cardId,
    name: card.name,
    domain: colorsToDomain(card.colors ?? []),
    rarity: normalizeRarity(card.rarity ?? 'common'),
    type: card.type || 'Unit',
    set: card.setAbbr || card.set || '',
    setName: card.set || card.setAbbr || '',
    cost: card.cost ?? null,
    might: card.might ?? null,
    power: card.power ?? null,
    owned: ownedQty,
    wishlist: wishlist.has(card.cardId),
    fav: favorites.has(card.cardId),
    dateAdded: Date.now(),
    imageUrl: card.imageUrl || undefined,
    effect: card.effect || undefined,
    flavorText: card.flavorText || undefined,
    tags: card.tags ?? [],
    sourceType: 'catalog',
  };
}
