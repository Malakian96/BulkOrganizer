import { Card } from '../../../domain/card/Card';
import { ICardRepository } from '../../../domain/card/ICardRepository';
import { ApplicationError } from '../../shared/ApplicationError';
import { AddCardCommand } from './AddCardCommand';

// Port implemented by the catalog service — only existence matters here
export interface CatalogCardLookup {
  findByCardId(cardId: string): Promise<unknown | null>;
}

export class AddCardHandler {
  constructor(
    private readonly repo: ICardRepository,
    private readonly catalog: CatalogCardLookup
  ) {}

  async execute(cmd: AddCardCommand): Promise<Card> {
    // Only real catalog cards can enter the collection
    const catalogCard = await this.catalog.findByCardId(cmd.cardId);
    if (!catalogCard) throw new ApplicationError(`Card not found in catalog: ${cmd.cardId}`);

    // A card has one collection entry — adding an owned card merges quantities
    const existing = await this.repo.findByCardId(cmd.cardId);
    if (existing) {
      existing.update({
        quantity: existing.quantity + (cmd.quantity ?? 1),
        foilQuantity: existing.foilQuantity + (cmd.foilQuantity ?? 0),
      });
      await this.repo.save(existing);
      return existing;
    }

    const card = Card.create(cmd);
    await this.repo.save(card);
    return card;
  }
}
