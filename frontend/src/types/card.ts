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

export interface CreateCardPayload {
  cardId: string;
  name: string;
  effect?: string;
  flavorText?: string;
  colors?: string[];
  cost?: number | null;
  type?: string;
  supertype?: string | null;
  might?: number | null;
  tags?: string[];
  set?: string;
  rarity?: string;
  imageUrl?: string;
  hasFoil?: boolean;
  promo?: boolean;
  banned?: boolean;
  quantity?: number;
  foilQuantity?: number;
  notes?: string;
}

export interface BulkEditPayload {
  ids: string[];
  patch: Partial<Pick<
    CardDTO,
    | 'quantity' | 'foilQuantity' | 'notes'
    | 'effect' | 'flavorText' | 'colors' | 'cost'
    | 'type' | 'supertype' | 'might' | 'tags'
    | 'set' | 'rarity' | 'imageUrl'
    | 'hasFoil' | 'promo' | 'banned'
  >>;
}

export interface RemoveCardsPayload {
  ids: string[];
}
