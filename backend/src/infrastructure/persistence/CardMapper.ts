import { Card } from '../../domain/card/Card';
import { CardId } from '../../domain/card/CardId';
import { CardName } from '../../domain/card/CardName';
import { ICardDocument } from './CardDocument';

export class CardMapper {
  static toDomain(doc: ICardDocument): Card {
    return Card.reconstitute({
      id: CardId.from(doc._id as string),
      cardId: doc.cardId,
      name: CardName.create(doc.name),
      effect: doc.effect,
      flavorText: doc.flavorText,
      colors: doc.colors,
      cost: doc.cost,
      type: doc.type,
      supertype: doc.supertype,
      might: doc.might,
      tags: doc.tags,
      set: doc.set,
      rarity: doc.rarity,
      imageUrl: doc.imageUrl,
      hasFoil: doc.hasFoil,
      promo: doc.promo,
      banned: doc.banned,
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
      name: card.name,
      effect: card.effect,
      flavorText: card.flavorText,
      colors: card.colors,
      cost: card.cost,
      type: card.type,
      supertype: card.supertype,
      might: card.might,
      tags: card.tags,
      set: card.set,
      rarity: card.rarity,
      imageUrl: card.imageUrl,
      hasFoil: card.hasFoil,
      promo: card.promo,
      banned: card.banned,
      quantity: card.quantity,
      foilQuantity: card.foilQuantity,
      notes: card.notes,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }
}
