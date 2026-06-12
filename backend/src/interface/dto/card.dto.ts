import { z } from 'zod';

// Collection entries reference catalog cards — only entry fields are accepted
export const createCardSchema = z.object({
  cardId: z.string().min(1).max(40),
  quantity: z.number().int().min(0).optional(),
  foilQuantity: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

const patchSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  foilQuantity: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

export const bulkEditSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  patch: patchSchema.refine(
    (p) => Object.keys(p).length > 0,
    { message: 'Patch must contain at least one field' }
  ),
});

export const removeCardsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

// Entry fields + card facts joined from the catalog at read time
export interface CardResponseDTO {
  id: string;
  cardId: string;
  name: string;
  effect: string;
  flavorText: string;
  colors: string[];
  cost: number | null;
  type: string;
  supertype: string | null;
  might: number | null;
  power: number | null;
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
  createdAt: string;
  updatedAt: string;
}
