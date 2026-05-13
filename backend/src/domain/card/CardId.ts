import { v4 as uuidv4, validate } from 'uuid';
import { DomainError } from '../shared/DomainError';

export class CardId {
  private constructor(private readonly value: string) {}

  static create(): CardId {
    return new CardId(uuidv4());
  }

  static from(value: string): CardId {
    if (!validate(value)) throw new DomainError(`Invalid CardId: "${value}"`);
    return new CardId(value);
  }

  toString(): string {
    return this.value;
  }
}
