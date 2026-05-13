import { CatalogModel } from '../persistence/CatalogDocument';

export interface CatalogCard {
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
  setAbbr: string;
  rarity: string;
  imageUrl: string;
  hasFoil: boolean;
  promo: boolean;
  banned: boolean;
}

export interface CatalogFilter {
  name?: string;
  set?: string;
  type?: string;
  rarity?: string;
  colors?: string[];
}

function docToCard(d: ReturnType<typeof toPlain>): CatalogCard {
  return {
    cardId: d.cardId as string,
    name: d.name as string,
    effect: (d.effect as string) ?? '',
    flavorText: (d.flavorText as string) ?? '',
    colors: (d.colors as string[]) ?? [],
    cost: (d.cost as number | null) ?? null,
    type: (d.type as string) ?? '',
    supertype: (d.supertype as string | null) ?? null,
    might: (d.might as number | null) ?? null,
    tags: (d.tags as string[]) ?? [],
    set: (d.set as string) ?? '',
    setAbbr: (d.setAbbr as string) ?? '',
    rarity: (d.rarity as string) ?? '',
    imageUrl: (d.imageUrl as string) ?? '',
    hasFoil: (d.hasFoil as boolean) ?? false,
    promo: (d.promo as boolean) ?? false,
    banned: (d.banned as boolean) ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlain(d: any) { return d; }

function buildQuery(filter?: CatalogFilter): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (filter?.name) query.name = { $regex: filter.name, $options: 'i' };
  if (filter?.set) query.set = filter.set;
  if (filter?.type) query.type = filter.type;
  if (filter?.rarity) query.rarity = filter.rarity;
  if (filter?.colors?.length) query.colors = { $in: filter.colors };
  return query;
}

export const mongoCatalogService = {
  async search(q: string, limit = 10): Promise<CatalogCard[]> {
    if (!q.trim()) return [];
    const docs = await CatalogModel
      .find({ name: { $regex: q, $options: 'i' } })
      .limit(limit)
      .lean()
      .exec();
    return docs.map(docToCard);
  },

  async findAll(
    filter?: CatalogFilter,
    page = 1,
    limit = 48
  ): Promise<{ cards: CatalogCard[]; total: number; page: number; totalPages: number }> {
    const query = buildQuery(filter);
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      CatalogModel.find(query).sort({ set: 1, cardId: 1 }).skip(skip).limit(limit).lean().exec(),
      CatalogModel.countDocuments(query).exec(),
    ]);

    return {
      cards: docs.map(docToCard),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getSets(): Promise<string[]> {
    const sets = await CatalogModel.distinct('set').exec();
    return (sets as string[]).filter(Boolean).sort();
  },

  async count(): Promise<number> {
    return CatalogModel.countDocuments().exec();
  },
};
