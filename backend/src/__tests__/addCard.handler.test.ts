import { AddCardHandler, CatalogCardLookup } from '../application/card/AddCard/AddCardHandler';
import { ApplicationError } from '../application/shared/ApplicationError';
import { Card } from '../domain/card/Card';
import { ICardRepository } from '../domain/card/ICardRepository';

class InMemoryCardRepository implements ICardRepository {
  private cards = new Map<string, Card>();

  async findById(id: string): Promise<Card | null> {
    return this.cards.get(id) ?? null;
  }

  async findByCardId(cardId: string): Promise<Card | null> {
    for (const card of this.cards.values()) {
      if (card.cardId === cardId) return card;
    }
    return null;
  }

  async findAll(): Promise<Card[]> {
    return [...this.cards.values()];
  }

  async save(card: Card): Promise<void> {
    this.cards.set(card.id, card);
  }

  async deleteMany(ids: string[]): Promise<void> {
    ids.forEach((id) => this.cards.delete(id));
  }
}

const catalogWith = (...cardIds: string[]): CatalogCardLookup => ({
  findByCardId: async (cardId: string) => (cardIds.includes(cardId) ? { cardId } : null),
});

describe('AddCardHandler', () => {
  it('creates a new entry for a card not yet in the collection', async () => {
    const repo = new InMemoryCardRepository();
    const handler = new AddCardHandler(repo, catalogWith('OGN-046'));

    const card = await handler.execute({ cardId: 'OGN-046', quantity: 2 });

    expect(card.quantity).toBe(2);
    expect(await repo.findAll()).toHaveLength(1);
  });

  it('rejects cards that do not exist in the catalog', async () => {
    const repo = new InMemoryCardRepository();
    const handler = new AddCardHandler(repo, catalogWith('OGN-046'));

    await expect(handler.execute({ cardId: 'FAKE-001' })).rejects.toThrow(ApplicationError);
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('merges quantities instead of duplicating an owned card', async () => {
    const repo = new InMemoryCardRepository();
    const handler = new AddCardHandler(repo, catalogWith('OGN-046'));

    const first = await handler.execute({ cardId: 'OGN-046', quantity: 2 });
    const merged = await handler.execute({ cardId: 'OGN-046', quantity: 3, foilQuantity: 1 });

    expect(merged.id).toBe(first.id);
    expect(merged.quantity).toBe(5);
    expect(merged.foilQuantity).toBe(1);
    expect(await repo.findAll()).toHaveLength(1);
  });

  it('defaults the added quantity to 1 when merging', async () => {
    const repo = new InMemoryCardRepository();
    const handler = new AddCardHandler(repo, catalogWith('OGN-046'));

    await handler.execute({ cardId: 'OGN-046', quantity: 2 });
    const merged = await handler.execute({ cardId: 'OGN-046' });

    expect(merged.quantity).toBe(3);
  });
});
