import { AddCardHandler } from '../application/card/AddCard/AddCardHandler';
import { Card } from '../domain/card/Card';
import { CardFilter, ICardRepository } from '../domain/card/ICardRepository';

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

  async findAll(_filter?: CardFilter): Promise<Card[]> {
    return [...this.cards.values()];
  }

  async save(card: Card): Promise<void> {
    this.cards.set(card.id, card);
  }

  async deleteMany(ids: string[]): Promise<void> {
    ids.forEach((id) => this.cards.delete(id));
  }
}

describe('AddCardHandler', () => {
  it('creates a new entry for a card not yet in the collection', async () => {
    const repo = new InMemoryCardRepository();
    const handler = new AddCardHandler(repo);

    const card = await handler.execute({ cardId: 'OGN-046', name: 'Annie', quantity: 2 });

    expect(card.quantity).toBe(2);
    expect(await repo.findAll()).toHaveLength(1);
  });

  it('merges quantities instead of duplicating an owned card', async () => {
    const repo = new InMemoryCardRepository();
    const handler = new AddCardHandler(repo);

    const first = await handler.execute({ cardId: 'OGN-046', name: 'Annie', quantity: 2 });
    const merged = await handler.execute({ cardId: 'OGN-046', name: 'Annie', quantity: 3 });

    expect(merged.id).toBe(first.id);
    expect(merged.quantity).toBe(5);
    expect(await repo.findAll()).toHaveLength(1);
  });

  it('defaults the added quantity to 1 when merging', async () => {
    const repo = new InMemoryCardRepository();
    const handler = new AddCardHandler(repo);

    await handler.execute({ cardId: 'OGN-046', name: 'Annie', quantity: 2 });
    const merged = await handler.execute({ cardId: 'OGN-046', name: 'Annie' });

    expect(merged.quantity).toBe(3);
  });
});
