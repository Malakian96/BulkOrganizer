import { Card } from './Card';

export interface CardFilter {
  name?: string;
  set?: string;
  type?: string;
  rarity?: string;
  colors?: string[];
}

export interface ICardRepository {
  findById(id: string): Promise<Card | null>;
  findAll(filter?: CardFilter): Promise<Card[]>;
  save(card: Card): Promise<void>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}
