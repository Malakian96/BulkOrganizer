import { DomainError } from '../shared/DomainError';

export class CardName {
  private constructor(private readonly value: string) {}

  static create(value: string): CardName {
    const trimmed = value.trim();
    if (trimmed.length === 0) throw new DomainError('CardName cannot be empty');
    if (trimmed.length > 200) throw new DomainError('CardName too long (max 200 chars)');
    return new CardName(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
