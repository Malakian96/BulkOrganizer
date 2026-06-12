import { Card } from '../domain/card/Card';
import { CardId } from '../domain/card/CardId';
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

describe('Card.create', () => {
  it('creates an entry with defaults', () => {
    const card = Card.create({ cardId: 'SFD-001' });
    expect(card.cardId).toBe('SFD-001');
    expect(card.quantity).toBe(1);
    expect(card.foilQuantity).toBe(0);
    expect(card.notes).toBe('');
  });

  it('trims the cardId and rejects blanks', () => {
    expect(Card.create({ cardId: '  OGN-001  ' }).cardId).toBe('OGN-001');
    expect(() => Card.create({ cardId: '   ' })).toThrow(DomainError);
  });

  it('rejects negative quantities at creation', () => {
    expect(() => Card.create({ cardId: 'OGN-001', quantity: -1 })).toThrow(DomainError);
    expect(() => Card.create({ cardId: 'OGN-001', foilQuantity: -1 })).toThrow(DomainError);
  });
});

describe('Card.update', () => {
  it('rejects negative quantity', () => {
    const card = Card.create({ cardId: 'SFD-001' });
    expect(() => card.update({ quantity: -1 })).toThrow(DomainError);
  });

  it('allows quantity of 0', () => {
    const card = Card.create({ cardId: 'SFD-001', quantity: 2 });
    card.update({ quantity: 0 });
    expect(card.quantity).toBe(0);
  });

  it('rejects negative foil quantity', () => {
    const card = Card.create({ cardId: 'SFD-001' });
    expect(() => card.update({ foilQuantity: -1 })).toThrow(DomainError);
  });

  it('updates multiple fields at once', () => {
    const card = Card.create({ cardId: 'SFD-001' });
    card.update({ quantity: 3, foilQuantity: 1, notes: 'Trade copy' });
    expect(card.quantity).toBe(3);
    expect(card.foilQuantity).toBe(1);
    expect(card.notes).toBe('Trade copy');
  });
});
