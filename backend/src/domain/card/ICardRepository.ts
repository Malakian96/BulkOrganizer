import { Card } from './Card';

export interface CardFilter {
  userId: string;
  name?: string;
  set?: string;
  type?: string;
  rarity?: string;
  colors?: string[];
}

export interface ICardRepository {
  findById(id: string, userId: string): Promise<Card | null>;
  findAll(filter: CardFilter): Promise<Card[]>;
  save(card: Card): Promise<void>;
  delete(id: string, userId: string): Promise<void>;
  deleteMany(ids: string[], userId: string): Promise<void>;
}
