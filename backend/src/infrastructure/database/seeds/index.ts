import type { Seed } from './Seed';
import { seed as s001 } from './001_dev_sample_cards';

// Add new seeds here. Seeds run in order when `npm run seed` is executed.
// Seeds never run in production — see SeedRunner.ts.
export const seeds: Seed[] = [
  s001,
];
