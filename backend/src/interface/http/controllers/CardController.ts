import { Request, Response, NextFunction } from 'express';
import { Card } from '../../../domain/card/Card';
import { AddCardHandler } from '../../../application/card/AddCard/AddCardHandler';
import { RemoveCardHandler } from '../../../application/card/RemoveCard/RemoveCardHandler';
import { BulkEditCardsHandler } from '../../../application/card/BulkEditCards/BulkEditCardsHandler';
import { GetCardsHandler } from '../../../application/card/GetCards/GetCardsHandler';
import { CardResponseDTO } from '../../dto/card.dto';

function toDTO(card: Card): CardResponseDTO {
  return {
    id: card.id,
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
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

export class CardController {
  constructor(
    private readonly addCardHandler: AddCardHandler,
    private readonly removeCardHandler: RemoveCardHandler,
    private readonly bulkEditHandler: BulkEditCardsHandler,
    private readonly getCardsHandler: GetCardsHandler
  ) {}

  listCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, set, type, rarity, colors } = req.query as Record<string, string | undefined>;
      const cards = await this.getCardsHandler.execute({
        name,
        set,
        type,
        rarity,
        colors: colors ? colors.split(',') : undefined,
      });
      res.json(cards.map(toDTO));
    } catch (e) {
      next(e);
    }
  };

  createCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const card = await this.addCardHandler.execute(req.body);
      res.status(201).json(toDTO(card));
    } catch (e) {
      next(e);
    }
  };

  removeCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.removeCardHandler.execute({ ids: req.body.ids });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };

  bulkEditCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cards = await this.bulkEditHandler.execute(req.body);
      res.json(cards.map(toDTO));
    } catch (e) {
      next(e);
    }
  };
}
