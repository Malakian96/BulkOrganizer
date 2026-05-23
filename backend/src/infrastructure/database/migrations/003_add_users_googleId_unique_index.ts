import type { Migration } from './Migration';

export const migration: Migration = {
  name: '003_add_users_googleId_unique_index',
  async up(db) {
    await db.collection('users').createIndex({ googleId: 1 }, { unique: true, background: true });
  },
};
