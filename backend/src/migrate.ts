import 'dotenv/config';
import { env } from './infrastructure/config/env';
import { mongoConnection } from './infrastructure/database/mongoConnection';
import { runMigrations } from './infrastructure/database/migrations/MigrationRunner';

async function main() {
  await mongoConnection.connect(env.MONGODB_URI);
  await runMigrations();
  await mongoConnection.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error('[migrate] Fatal:', err); process.exit(1); });
