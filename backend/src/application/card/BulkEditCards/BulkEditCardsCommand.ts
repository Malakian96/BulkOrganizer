export interface BulkEditCardsCommand {
  ids: string[];
  patch: Partial<{
    quantity: number;
    foilQuantity: number;
    notes: string;
  }>;
}
