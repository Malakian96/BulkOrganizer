import { Card } from '../../../domain/card/Card';
import { ICardRepository } from '../../../domain/card/ICardRepository';
import { AddCardCommand } from './AddCardCommand';

export class AddCardHandler {
  constructor(private readonly repo: ICardRepository) {}

  async execute(cmd: AddCardCommand): Promise<Card> {
    const card = Card.create(cmd);
    await this.repo.save(card);
    return card;
  }
}
