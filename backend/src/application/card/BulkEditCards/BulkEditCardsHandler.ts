import { Card } from '../../../domain/card/Card';
import { ICardRepository } from '../../../domain/card/ICardRepository';
import { ApplicationError } from '../../shared/ApplicationError';
import { BulkEditCardsCommand } from './BulkEditCardsCommand';

export class BulkEditCardsHandler {
  constructor(private readonly repo: ICardRepository) {}

  async execute(cmd: BulkEditCardsCommand): Promise<Card[]> {
    if (cmd.ids.length === 0) throw new ApplicationError('No IDs provided');
    if (Object.keys(cmd.patch).length === 0) throw new ApplicationError('Patch is empty');

    const results: Card[] = [];
    for (const id of cmd.ids) {
      const card = await this.repo.findById(id);
      if (!card) throw new ApplicationError(`Card not found: ${id}`);
      card.update(cmd.patch);
      await this.repo.save(card);
      results.push(card);
    }
    return results;
  }
}
