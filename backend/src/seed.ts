import 'dotenv/config';
import { env } from './infrastructure/config/env';
import { mongoConnection } from './infrastructure/database/mongoConnection';
import { runSeeds } from './infrastructure/database/seeds/SeedRunner';

async function main() {
  await mongoConnection.connect(env.MONGODB_URI);
  await runSeeds();
  await mongoConnection.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error('[seed] Fatal:', err); process.exit(1); });
