export interface AddCardCommand {
  cardId: string;       // Must exist in the catalog
  quantity?: number;
  foilQuantity?: number;
  notes?: string;
}
