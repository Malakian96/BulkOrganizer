import { Schema, model } from 'mongoose';

interface ICatalogData {
  cardId: string;
  name: string;
  effect: string;
  flavorText: string;
  colors: string[];
  cost: number | null;
  power: number | null;
  type: string;
  supertype: string | null;
  might: number | null;
  tags: string[];
  set: string;
  setAbbr: string;
  rarity: string;
  imageUrl: string;
  hasFoil: boolean;
  promo: boolean;
  banned: boolean;
  scrapedAt: Date;
}

const catalogSchema = new Schema<ICatalogData>(
  {
    cardId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    effect: { type: String, default: '' },
    flavorText: { type: String, default: '' },
    colors: [{ type: String }],
    cost: { type: Number, default: null },
    power: { type: Number, default: null },
    type: { type: String, default: '' },
    supertype: { type: String, default: null },
    might: { type: Number, default: null },
    tags: [{ type: String }],
    set: { type: String, default: '' },
    setAbbr: { type: String, default: '' },
    rarity: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    hasFoil: { type: Boolean, default: false },
    promo: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    scrapedAt: { type: Date, default: Date.now },
  },
  { collection: 'catalog' }
);

catalogSchema.index({ name: 'text' });
catalogSchema.index({ set: 1 });
catalogSchema.index({ type: 1 });
catalogSchema.index({ rarity: 1 });
catalogSchema.index({ colors: 1 });

export const CatalogModel = model<ICatalogData>('Catalog', catalogSchema);
