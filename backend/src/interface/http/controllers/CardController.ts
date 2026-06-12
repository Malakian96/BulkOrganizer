import { Request, Response, NextFunction } from 'express';
import { Card } from '../../../domain/card/Card';
import { AddCardHandler } from '../../../application/card/AddCard/AddCardHandler';
import { RemoveCardHandler } from '../../../application/card/RemoveCard/RemoveCardHandler';
import { BulkEditCardsHandler } from '../../../application/card/BulkEditCards/BulkEditCardsHandler';
import { GetCardsHandler } from '../../../application/card/GetCards/GetCardsHandler';
import { CatalogCard } from '../../../infrastructure/catalog/MongoCatalogService';
import { CardResponseDTO } from '../../dto/card.dto';

// Read-time join: entry fields + card facts from the catalog. Entries whose
// catalog card disappeared render as a minimal placeholder.
function toDTO(entry: Card, facts: CatalogCard | undefined): CardResponseDTO {
  return {
    id: entry.id,
    cardId: entry.cardId,
    name: facts?.name ?? entry.cardId,
    effect: facts?.effect ?? '',
    flavorText: facts?.flavorText ?? '',
    colors: facts?.colors ?? [],
    cost: facts?.cost ?? null,
    type: facts?.type ?? '',
    supertype: facts?.supertype ?? null,
    might: facts?.might ?? null,
    power: facts?.power ?? null,
    tags: facts?.tags ?? [],
    set: facts?.set ?? '',
    rarity: facts?.rarity ?? '',
    imageUrl: facts?.imageUrl ?? '',
    hasFoil: facts?.hasFoil ?? false,
    promo: facts?.promo ?? false,
    banned: facts?.banned ?? false,
    quantity: entry.quantity,
    foilQuantity: entry.foilQuantity,
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

// Port implemented by the catalog service
export interface CatalogFactsLookup {
  findByCardIds(cardIds: string[]): Promise<Map<string, CatalogCard>>;
}

export class CardController {
  constructor(
    private readonly addCardHandler: AddCardHandler,
    private readonly removeCardHandler: RemoveCardHandler,
    private readonly bulkEditHandler: BulkEditCardsHandler,
    private readonly getCardsHandler: GetCardsHandler,
    private readonly catalog: CatalogFactsLookup
  ) {}

  private async withFacts(entries: Card[]): Promise<CardResponseDTO[]> {
    const facts = await this.catalog.findByCardIds(entries.map((e) => e.cardId));
    return entries.map((e) => toDTO(e, facts.get(e.cardId)));
  }

  listCards = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const entries = await this.getCardsHandler.execute();
      res.json(await this.withFacts(entries));
    } catch (e) {
      next(e);
    }
  };

  createCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const entry = await this.addCardHandler.execute(req.body);
      const [dto] = await this.withFacts([entry]);
      res.status(201).json(dto);
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
      const entries = await this.bulkEditHandler.execute(req.body);
      res.json(await this.withFacts(entries));
    } catch (e) {
      next(e);
    }
  };
}
