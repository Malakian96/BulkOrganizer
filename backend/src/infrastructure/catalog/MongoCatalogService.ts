import { CatalogModel } from '../persistence/CatalogDocument';

export interface CatalogCard {
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
}

export interface CatalogFilter {
  name?: string;
  set?: string;
  type?: string;
  rarity?: string;
  colors?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToCard(d: any): CatalogCard {
  return {
    cardId: d.cardId as string,
    name: d.name as string,
    effect: (d.effect as string) ?? '',
    flavorText: (d.flavorText as string) ?? '',
    colors: (d.colors as string[]) ?? [],
    cost: (d.cost as number | null) ?? null,
    power: (d.power as number | null) ?? null,
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

  async findByCardId(cardId: string): Promise<CatalogCard | null> {
    const doc = await CatalogModel.findOne({ cardId }).lean().exec();
    return doc ? docToCard(doc) : null;
  },

  // Flexible lookup for OCR results — tries common cardId formats the scraper may use
  async findBySetAndNumber(setAbbr: string, number: string): Promise<CatalogCard | null> {
    const n = parseInt(number, 10); // strip leading zeros: "046" → 46
    const candidates = [
      `${setAbbr}-${number}`,       // SFD-046
      `${setAbbr}-${n}`,            // SFD-46
      `${setAbbr}${number}`,        // SFD046
      `${setAbbr}${n}`,             // SFD46
      `${setAbbr} ${number}`,       // SFD 046
      `${setAbbr} • ${number}`,     // SFD • 046
    ];
    for (const id of candidates) {
      const doc = await CatalogModel.findOne({ cardId: id }).lean().exec();
      if (doc) return docToCard(doc);
    }
    // Last resort: regex match within the set
    const doc = await CatalogModel.findOne({
      setAbbr,
      cardId: { $regex: String(n) },
    }).lean().exec();
    return doc ? docToCard(doc) : null;
  },

  async count(): Promise<number> {
    return CatalogModel.countDocuments().exec();
  },
};
