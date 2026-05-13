import { Card } from '../../../domain/card/Card';
import { ICardRepository } from '../../../domain/card/ICardRepository';
import { GetCardsQuery } from './GetCardsQuery';

export class GetCardsHandler {
  constructor(private readonly repo: ICardRepository) {}

  async execute(query: GetCardsQuery): Promise<Card[]> {
    return this.repo.findAll(query);
  }
}
