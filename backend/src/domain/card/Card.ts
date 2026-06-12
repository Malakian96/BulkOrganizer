import { DomainError } from '../shared/DomainError';
import { CardId } from './CardId';

// A collection entry: which catalog card you own and how many copies.
// Card facts (name, cost, rarity, …) are owned by the catalog and joined
// at read time — they are never stored or edited here.
interface CardProps {
  id: CardId;
  cardId: string;          // Official game ID e.g. "OGN-179" — catalog key
  quantity: number;
  foilQuantity: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Card {
  private props: CardProps;

  private constructor(props: CardProps) {
    this.props = props;
  }

  static create(params: {
    cardId: string;
    quantity?: number;
    foilQuantity?: number;
    notes?: string;
  }): Card {
    if (!params.cardId.trim()) throw new DomainError('cardId is required');
    const quantity = params.quantity ?? 1;
    const foilQuantity = params.foilQuantity ?? 0;
    if (quantity < 0) throw new DomainError('Quantity cannot be negative');
    if (foilQuantity < 0) throw new DomainError('Foil quantity cannot be negative');

    return new Card({
      id: CardId.create(),
      cardId: params.cardId.trim(),
      quantity,
      foilQuantity,
      notes: params.notes ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: {
    id: CardId;
    cardId: string;
    quantity: number;
    foilQuantity: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
  }): Card {
    return new Card(props);
  }

  get id(): string { return this.props.id.toString(); }
  get cardId(): string { return this.props.cardId; }
  get quantity(): number { return this.props.quantity; }
  get foilQuantity(): number { return this.props.foilQuantity; }
  get notes(): string { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  update(params: Partial<{
    quantity: number;
    foilQuantity: number;
    notes: string;
  }>): void {
    if (params.quantity !== undefined) {
      if (params.quantity < 0) throw new DomainError('Quantity cannot be negative');
      this.props.quantity = params.quantity;
    }
    if (params.foilQuantity !== undefined) {
      if (params.foilQuantity < 0) throw new DomainError('Foil quantity cannot be negative');
      this.props.foilQuantity = params.foilQuantity;
    }
    if (params.notes !== undefined) this.props.notes = params.notes;
    this.props.updatedAt = new Date();
  }
}
