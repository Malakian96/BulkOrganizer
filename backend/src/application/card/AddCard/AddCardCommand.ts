export interface AddCardCommand {
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
