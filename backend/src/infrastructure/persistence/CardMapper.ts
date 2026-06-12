import { Card } from '../../domain/card/Card';
import { CardId } from '../../domain/card/CardId';
import { ICardDocument } from './CardDocument';

export class CardMapper {
  static toDomain(doc: ICardDocument): Card {
    return Card.reconstitute({
      id: CardId.from(doc._id as string),
      cardId: doc.cardId,
      quantity: doc.quantity,
      foilQuantity: doc.foilQuantity,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(card: Card): Record<string, unknown> {
    return {
      _id: card.id,
      cardId: card.cardId,
      quantity: card.quantity,
      foilQuantity: card.foilQuantity,
      notes: card.notes,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }
}
