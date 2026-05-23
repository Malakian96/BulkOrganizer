import type { Migration } from './Migration';
import { migration as m001 } from './001_add_card_userId_indexes';
import { migration as m002 } from './002_remove_orphaned_cards';
import { migration as m003 } from './003_add_users_googleId_unique_index';

// Add new migrations here in order. Never remove or reorder existing entries.
export const migrations: Migration[] = [
  m001,
  m002,
  m003,
];
