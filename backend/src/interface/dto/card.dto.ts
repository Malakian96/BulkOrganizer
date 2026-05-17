import { z } from 'zod';

export const createCardSchema = z.object({
  cardId: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  effect: z.string().optional(),
  flavorText: z.string().optional(),
  colors: z.array(z.string()).optional(),
  cost: z.number().int().min(0).nullable().optional(),
  type: z.string().optional(),
  supertype: z.string().nullable().optional(),
  might: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
  set: z.string().optional(),
  rarity: z.string().optional(),
  imageUrl: z.string().optional(),
  hasFoil: z.boolean().optional(),
  promo: z.boolean().optional(),
  banned: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  foilQuantity: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

const patchSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  foilQuantity: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  effect: z.string().optional(),
  flavorText: z.string().optional(),
  colors: z.array(z.string()).optional(),
  cost: z.number().int().min(0).nullable().optional(),
  type: z.string().optional(),
  supertype: z.string().nullable().optional(),
  might: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
  set: z.string().optional(),
  rarity: z.string().optional(),
  imageUrl: z.string().optional(),
  hasFoil: z.boolean().optional(),
  promo: z.boolean().optional(),
  banned: z.boolean().optional(),
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

export const getCardsQuerySchema = z.object({
  name: z.string().optional(),
  set: z.string().optional(),
  type: z.string().optional(),
  rarity: z.string().optional(),
  colors: z.string().optional(),
});

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

