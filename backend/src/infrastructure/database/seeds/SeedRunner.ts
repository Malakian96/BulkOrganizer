import { env } from '../../config/env';
import { seeds } from './index';

export async function runSeeds(): Promise<void> {
  if (env.NODE_ENV === 'production') {
    console.log('[Seeds] Skipped — seeds do not run in production');
    return;
  }

  if (seeds.length === 0) {
    console.log('[Seeds] No seeds registered');
    return;
  }

  console.log(`[Seeds] Running ${seeds.length} seed(s) in ${env.NODE_ENV}…`);

  for (const seed of seeds) {
    console.log(`[Seeds] → ${seed.name}`);
    await seed.run();
    console.log(`[Seeds] ✓ ${seed.name}`);
  }

  console.log('[Seeds] Complete');
}
