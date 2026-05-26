import type { Migration } from './Migration';

// Cards created before auth was added have no userId and are inaccessible to any user.
// This migration removes them so they don't silently occupy storage.
export const migration: Migration = {
  name: '002_remove_orphaned_cards',
  async up(db) {
    const result = await db.collection('cards').deleteMany({ userId: { $exists: false } });
    if (result.deletedCount > 0) {
      console.log(`[002] Removed ${result.deletedCount} orphaned card(s) with no userId`);
    }
  },
};
