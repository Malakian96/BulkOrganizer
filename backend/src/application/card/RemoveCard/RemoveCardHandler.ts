import { ICardRepository } from '../../../domain/card/ICardRepository';
import { ApplicationError } from '../../shared/ApplicationError';
import { RemoveCardCommand } from './RemoveCardCommand';

export class RemoveCardHandler {
  constructor(private readonly repo: ICardRepository) {}

  async execute(cmd: RemoveCardCommand): Promise<void> {
    if (cmd.ids.length === 0) throw new ApplicationError('No IDs provided');
    await this.repo.deleteMany(cmd.ids);
  }
}
