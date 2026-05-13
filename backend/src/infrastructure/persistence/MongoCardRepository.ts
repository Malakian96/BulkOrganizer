import { Card } from '../../domain/card/Card';
import { CardFilter, ICardRepository } from '../../domain/card/ICardRepository';
import { CardMapper } from './CardMapper';
import { CardModel } from './CardDocument';

export class MongoCardRepository implements ICardRepository {
  async findById(id: string): Promise<Card | null> {
    const doc = await CardModel.findById(id).exec();
    return doc ? CardMapper.toDomain(doc) : null;
  }

  async findAll(filter?: CardFilter): Promise<Card[]> {
    const query: Record<string, unknown> = {};
    if (filter?.name) query.name = { $regex: filter.name, $options: 'i' };
    if (filter?.set) query.set = filter.set;
    if (filter?.type) query.type = filter.type;
    if (filter?.rarity) query.rarity = filter.rarity;
    if (filter?.colors?.length) query.colors = { $in: filter.colors };
    const docs = await CardModel.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(CardMapper.toDomain);
  }

  async save(card: Card): Promise<void> {
    const data = CardMapper.toPersistence(card);
    await CardModel.findByIdAndUpdate(
      card.id,
      { $set: data },
      { upsert: true, new: true }
    ).exec();
  }

  async delete(id: string): Promise<void> {
    await CardModel.findByIdAndDelete(id).exec();
  }

  async deleteMany(ids: string[]): Promise<void> {
    await CardModel.deleteMany({ _id: { $in: ids } }).exec();
  }
}
