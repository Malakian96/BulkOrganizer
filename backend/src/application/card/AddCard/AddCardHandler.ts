import { Card } from '../../../domain/card/Card';
import { ICardRepository } from '../../../domain/card/ICardRepository';
import { AddCardCommand } from './AddCardCommand';

export class AddCardHandler {
  constructor(private readonly repo: ICardRepository) {}

  async execute(cmd: AddCardCommand): Promise<Card> {
    // A card has one collection entry — adding an owned card merges quantities
    const existing = await this.repo.findByCardId(cmd.cardId);
    if (existing) {
      existing.update({ quantity: existing.quantity + (cmd.quantity ?? 1) });
      await this.repo.save(existing);
      return existing;
    }

    const card = Card.create(cmd);
    await this.repo.save(card);
    return card;
  }
}
