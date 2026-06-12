import { Card } from './Card';

export interface ICardRepository {
  findById(id: string): Promise<Card | null>;
  findByCardId(cardId: string): Promise<Card | null>;
  findAll(): Promise<Card[]>;
  save(card: Card): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}
