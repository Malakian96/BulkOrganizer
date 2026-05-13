import { DomainError } from '../shared/DomainError';
import { CardId } from './CardId';
import { CardName } from './CardName';

export interface CardProps {
  id: CardId;
  cardId: string;          // Official game ID e.g. "OGN-179"
  name: CardName;
  effect: string;
  flavorText: string;
  colors: string[];        // e.g. ["Chaos", "Order"]
  cost: number | null;
  type: string;            // "Spell" | "Unit" | "Gear" | "Terrain" | "Champion"
  supertype: string | null;
  might: number | null;
  tags: string[];          // e.g. ["Mech", "Piltover"]
  set: string;             // "Origins"
  rarity: string;          // "Common" | "Uncommon" | "Rare" | "Legendary"
  imageUrl: string;
  hasFoil: boolean;
  promo: boolean;
  banned: boolean;
  // Collection fields
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
    name: string;
    effect?: string;
    flavorText?: string;
    colors?: string[];
    cost?: number | null;
    type?: string;
    supertype?: string | null;
    might?: number | null;
    tags?: string[];
    set?: string;
    rarity?: string;
    imageUrl?: string;
    hasFoil?: boolean;
    promo?: boolean;
    banned?: boolean;
    quantity?: number;
    foilQuantity?: number;
    notes?: string;
  }): Card {
    return new Card({
      id: CardId.create(),
      cardId: params.cardId,
      name: CardName.create(params.name),
      effect: params.effect ?? '',
      flavorText: params.flavorText ?? '',
      colors: params.colors ?? [],
      cost: params.cost ?? null,
      type: params.type ?? '',
      supertype: params.supertype ?? null,
      might: params.might ?? null,
      tags: params.tags ?? [],
      set: params.set ?? '',
      rarity: params.rarity ?? '',
      imageUrl: params.imageUrl ?? '',
      hasFoil: params.hasFoil ?? false,
      promo: params.promo ?? false,
      banned: params.banned ?? false,
      quantity: params.quantity ?? 1,
      foilQuantity: params.foilQuantity ?? 0,
      notes: params.notes ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: CardProps): Card {
    return new Card(props);
  }

  get id(): string { return this.props.id.toString(); }
  get cardId(): string { return this.props.cardId; }
  get name(): string { return this.props.name.toString(); }
  get effect(): string { return this.props.effect; }
  get flavorText(): string { return this.props.flavorText; }
  get colors(): string[] { return [...this.props.colors]; }
  get cost(): number | null { return this.props.cost; }
  get type(): string { return this.props.type; }
  get supertype(): string | null { return this.props.supertype; }
  get might(): number | null { return this.props.might; }
  get tags(): string[] { return [...this.props.tags]; }
  get set(): string { return this.props.set; }
  get rarity(): string { return this.props.rarity; }
  get imageUrl(): string { return this.props.imageUrl; }
  get hasFoil(): boolean { return this.props.hasFoil; }
  get promo(): boolean { return this.props.promo; }
  get banned(): boolean { return this.props.banned; }
  get quantity(): number { return this.props.quantity; }
  get foilQuantity(): number { return this.props.foilQuantity; }
  get notes(): string { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  update(params: Partial<{
    quantity: number;
    foilQuantity: number;
    notes: string;
    effect: string;
    flavorText: string;
    colors: string[];
    cost: number | null;
    type: string;
    supertype: string | null;
    might: number | null;
    tags: string[];
    set: string;
    rarity: string;
    imageUrl: string;
    hasFoil: boolean;
    promo: boolean;
    banned: boolean;
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
    if (params.effect !== undefined) this.props.effect = params.effect;
    if (params.flavorText !== undefined) this.props.flavorText = params.flavorText;
    if (params.colors !== undefined) this.props.colors = params.colors;
    if (params.cost !== undefined) this.props.cost = params.cost;
    if (params.type !== undefined) this.props.type = params.type;
    if (params.supertype !== undefined) this.props.supertype = params.supertype;
    if (params.might !== undefined) this.props.might = params.might;
    if (params.tags !== undefined) this.props.tags = params.tags;
    if (params.set !== undefined) this.props.set = params.set;
    if (params.rarity !== undefined) this.props.rarity = params.rarity;
    if (params.imageUrl !== undefined) this.props.imageUrl = params.imageUrl;
    if (params.hasFoil !== undefined) this.props.hasFoil = params.hasFoil;
    if (params.promo !== undefined) this.props.promo = params.promo;
    if (params.banned !== undefined) this.props.banned = params.banned;
    this.props.updatedAt = new Date();
  }
}
