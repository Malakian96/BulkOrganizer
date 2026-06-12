import { Schema, model } from 'mongoose';

// Collection entry only — card facts live in the catalog collection and are
// joined at read time.
export interface ICardDocument {
  _id: string;
  cardId: string;
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

export const CardModel = model<ICardDocument>('Card', cardSchema);
