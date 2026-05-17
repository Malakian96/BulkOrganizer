import { Card } from '../domain/card/Card';
import { CardId } from '../domain/card/CardId';
import { CardName } from '../domain/card/CardName';
import { DomainError } from '../domain/shared/DomainError';

describe('CardId', () => {
  it('creates a valid UUID', () => {
    const id = CardId.create();
    expect(id.toString()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('rejects an invalid UUID', () => {
    expect(() => CardId.from('not-a-uuid')).toThrow(DomainError);
  });

  it('accepts a valid UUID string', () => {
    const raw = '550e8400-e29b-41d4-a716-446655440000';
    expect(CardId.from(raw).toString()).toBe(raw);
  });
});

describe('CardName', () => {
  it('trims whitespace', () => {
    expect(CardName.create('  Poro Snax  ').toString()).toBe('Poro Snax');
  });

  it('rejects empty name', () => {
    expect(() => CardName.create('')).toThrow(DomainError);
    expect(() => CardName.create('   ')).toThrow(DomainError);
  });

  it('rejects names over 200 chars', () => {
    expect(() => CardName.create('a'.repeat(201))).toThrow(DomainError);
  });

  it('accepts a name at exactly 200 chars', () => {
    expect(() => CardName.create('a'.repeat(200))).not.toThrow();
  });
});

describe('Card.create', () => {
  it('creates a card with defaults', () => {
    const card = Card.create({ cardId: 'SFD-001', name: 'Test Card' });
    expect(card.cardId).toBe('SFD-001');
    expect(card.name).toBe('Test Card');
    expect(card.quantity).toBe(1);
    expect(card.foilQuantity).toBe(0);
    expect(card.colors).toEqual([]);
  });

  it('stores all canonical Riftbound rarities without error', () => {
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'overnumbered'];
    for (const rarity of rarities) {
      const card = Card.create({ cardId: 'OGN-001', name: 'Card', rarity });
      expect(card.rarity).toBe(rarity);
    }
  });

  it('stores all canonical Riftbound types without error', () => {
    const types = ['Champion', 'Unit', 'Spell', 'Gear', 'Rune', 'Relic', 'Battlefield'];
    for (const type of types) {
      const card = Card.create({ cardId: 'OGN-001', name: 'Card', type });
      expect(card.type).toBe(type);
    }
  });
});

describe('Card.update', () => {
  it('rejects negative quantity', () => {
    const card = Card.create({ cardId: 'SFD-001', name: 'Poro Snax' });
    expect(() => card.update({ quantity: -1 })).toThrow(DomainError);
  });

  it('allows quantity of 0', () => {
    const card = Card.create({ cardId: 'SFD-001', name: 'Poro Snax', quantity: 2 });
    card.update({ quantity: 0 });
    expect(card.quantity).toBe(0);
  });

  it('rejects negative foil quantity', () => {
    const card = Card.create({ cardId: 'SFD-001', name: 'Poro Snax' });
    expect(() => card.update({ foilQuantity: -1 })).toThrow(DomainError);
  });

  it('updates multiple fields at once', () => {
    const card = Card.create({ cardId: 'SFD-001', name: 'Poro Snax' });
    card.update({ quantity: 3, notes: 'Trade copy', rarity: 'epic' });
    expect(card.quantity).toBe(3);
    expect(card.notes).toBe('Trade copy');
    expect(card.rarity).toBe('epic');
  });
});
