import { Schema, model, Document } from 'mongoose';

export interface ICardDocument extends Document {
  _id: string;
  cardId: string;
  name: string;
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
  quantity: number;
  foilQuantity: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICardDocument>(
  {
    _id: { type: String, required: true },
    cardId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    effect: { type: String, default: '' },
    flavorText: { type: String, default: '' },
    colors: [{ type: String }],
    cost: { type: Number, default: null },
    type: { type: String, default: '' },
    supertype: { type: String, default: null },
    might: { type: Number, default: null },
    tags: [{ type: String }],
    set: { type: String, default: '' },
    rarity: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    hasFoil: { type: Boolean, default: false },
    promo: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    quantity: { type: Number, default: 1, min: 0 },
    foilQuantity: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '' },
  },
  {
    _id: false,
    timestamps: true,
    collection: 'cards',
  }
);

cardSchema.index({ cardId: 1 });
cardSchema.index({ name: 1 });
cardSchema.index({ set: 1 });
cardSchema.index({ colors: 1 });
cardSchema.index({ type: 1 });
cardSchema.index({ rarity: 1 });

export const CardModel = model<ICardDocument>('Card', cardSchema);
