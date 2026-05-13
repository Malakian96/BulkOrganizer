export interface BulkEditCardsCommand {
  ids: string[];
  patch: Partial<{
    quantity: number;
    foilQuantity: number;
    notes: string;
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
  }>;
}
