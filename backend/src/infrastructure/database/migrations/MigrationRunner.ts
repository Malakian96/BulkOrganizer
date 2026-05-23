import mongoose, { Schema, model } from 'mongoose';
import { migrations } from './index';

interface IMigrationRecord {
  name: string;
  appliedAt: Date;
}

const migrationSchema = new Schema<IMigrationRecord>(
  {
    name:      { type: String, required: true, unique: true },
    appliedAt: { type: Date,   required: true },
  },
  { collection: '_migrations', _id: true }
);

// Guard against model redefinition in hot-reload environments
const MigrationModel =
  (mongoose.models['_Migration'] as mongoose.Model<IMigrationRecord> | undefined) ??
  model<IMigrationRecord>('_Migration', migrationSchema);

export async function runMigrations(): Promise<void> {
  const applied = await MigrationModel.find({}).lean();
  const appliedNames = new Set(applied.map(r => r.name));

  const pending = migrations.filter(m => !appliedNames.has(m.name));

  if (pending.length === 0) {
    console.log('[Migrations] All up to date');
    return;
  }

  console.log(`[Migrations] Applying ${pending.length} pending migration(s)…`);

  for (const migration of pending) {
    console.log(`[Migrations] → ${migration.name}`);
    await migration.up(mongoose.connection);
    await MigrationModel.create({ name: migration.name, appliedAt: new Date() });
    console.log(`[Migrations] ✓ ${migration.name}`);
  }

  console.log('[Migrations] Complete');
}
