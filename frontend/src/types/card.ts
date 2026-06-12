export interface CardDTO {
  id: string;
  cardId: string;
  name: string;
  effect: string;
  flavorText: string;
  colors: string[];
  cost: number | null;
  type: string;
  supertype: string | null;
  might: number | null;
  power: number | null;
  tags: string[];
  set: string;
  rarity: string;
  imageUrl: string;
  hasFoil: boolean;
  promo: boolean;
  banned: boolean;
  quantity: number;
  foilQuantity: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// The collection references catalog cards — only entry fields are sent
export interface CreateCardPayload {
  cardId: string;
  quantity?: number;
  foilQuantity?: number;
  notes?: string;
}

export interface BulkEditPayload {
  ids: string[];
  // Only collection-entry fields are editable — card facts come from the catalog
  patch: Partial<Pick<CardDTO, 'quantity' | 'foilQuantity' | 'notes'>>;
}

export interface RemoveCardsPayload {
  ids: string[];
}
