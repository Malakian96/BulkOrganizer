import { CardFilter } from '../../domain/card/ICardRepository';

// Shared filter → MongoDB query translation for collection and catalog reads
export function buildCardQuery(filter?: CardFilter): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (filter?.name) query.name = { $regex: filter.name, $options: 'i' };
  if (filter?.set) query.set = filter.set;
  if (filter?.type) query.type = filter.type;
  if (filter?.rarity) query.rarity = filter.rarity;
  if (filter?.colors?.length) query.colors = { $in: filter.colors };
  return query;
}
