import { Card } from '../../../domain/card/Card';
import { ICardRepository } from '../../../domain/card/ICardRepository';

export class GetCardsHandler {
  constructor(private readonly repo: ICardRepository) {}

  async execute(): Promise<Card[]> {
    return this.repo.findAll();
  }
}
