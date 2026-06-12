import { Card } from '../../domain/card/Card';
import { ICardRepository } from '../../domain/card/ICardRepository';
import { CardMapper } from './CardMapper';
import { CardModel } from './CardDocument';

export class MongoCardRepository implements ICardRepository {
  async findById(id: string): Promise<Card | null> {
    const doc = await CardModel.findById(id).exec();
    return doc ? CardMapper.toDomain(doc) : null;
  }

  async findByCardId(cardId: string): Promise<Card | null> {
    const doc = await CardModel.findOne({ cardId }).exec();
    return doc ? CardMapper.toDomain(doc) : null;
  }

  async findAll(): Promise<Card[]> {
    const docs = await CardModel.find().sort({ createdAt: -1 }).exec();
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

  async deleteMany(ids: string[]): Promise<void> {
    await CardModel.deleteMany({ _id: { $in: ids } }).exec();
  }
}
