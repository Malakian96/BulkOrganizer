import type { Migration } from './Migration';

export const migration: Migration = {
  name: '001_add_card_userId_indexes',
  async up(db) {
    const cards = db.collection('cards');
    await cards.createIndex({ userId: 1 }, { background: true });
    await cards.createIndex({ userId: 1, createdAt: -1 }, { background: true });
  },
};
