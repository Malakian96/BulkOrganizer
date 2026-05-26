export interface GetCardsQuery {
  userId: string;
  name?: string;
  set?: string;
  type?: string;
  rarity?: string;
  colors?: string[];
}
