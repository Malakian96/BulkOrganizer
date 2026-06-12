import { CardModel } from './CardDocument';

// Idempotent startup cleanup for databases written by earlier versions:
// - merges duplicate entries for the same cardId (sum of quantities)
// - strips card-fact fields that now live only in the catalog
export async function migrateCollectionEntries(): Promise<void> {
  const dupes: Array<{ _id: string; ids: string[]; quantity: number; foilQuantity: number }> =
    await CardModel.aggregate([
      {
        $group: {
          _id: '$cardId',
          ids: { $push: '$_id' },
          quantity: { $sum: { $ifNull: ['$quantity', 0] } },
          foilQuantity: { $sum: { $ifNull: ['$foilQuantity', 0] } },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]).exec();

  for (const d of dupes) {
    const [keep, ...rest] = d.ids;
    await CardModel.updateOne(
      { _id: keep },
      { $set: { quantity: d.quantity, foilQuantity: d.foilQuantity } }
    ).exec();
    await CardModel.deleteMany({ _id: { $in: rest } }).exec();
  }
  if (dupes.length > 0) {
    console.log(`[Migration] Merged ${dupes.length} duplicate collection entr${dupes.length === 1 ? 'y' : 'ies'}`);
  }

  const stripped = await CardModel.updateMany(
    { name: { $exists: true } },
    {
      $unset: {
        name: '', effect: '', flavorText: '', colors: '', cost: '', type: '',
        supertype: '', might: '', power: '', tags: '', set: '', rarity: '',
        imageUrl: '', hasFoil: '', promo: '', banned: '',
      },
    },
    { strict: false, strictQuery: false }
  ).exec();
  if (stripped.modifiedCount > 0) {
    console.log(`[Migration] Stripped card facts from ${stripped.modifiedCount} entries (now catalog-joined)`);
  }
}
