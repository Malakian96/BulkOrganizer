import { v4 as uuidv4 } from 'uuid';
import type { Seed } from './Seed';
import { UserModel } from '../../persistence/UserDocument';
import { CardModel } from '../../persistence/CardDocument';

const SEED_GOOGLE_ID = 'seed:dev-demo-user';

const SAMPLE_CARDS = [
  {
    cardId: 'OGN-001',
    name: 'Poro Snax',
    type: 'Gear',
    rarity: 'common',
    set: 'Origins',
    colors: ['Order'],
    cost: 1,
    effect: 'Give a friendly unit +1/+1.',
    quantity: 4,
    foilQuantity: 1,
  },
  {
    cardId: 'OGN-012',
    name: 'Spiritmeld Sage',
    type: 'Unit',
    rarity: 'uncommon',
    set: 'Origins',
    colors: ['Calm'],
    cost: 3,
    might: 2,
    effect: 'When played, draw a card.',
    quantity: 2,
    foilQuantity: 0,
  },
  {
    cardId: 'OGN-033',
    name: 'Runic Overload',
    type: 'Spell',
    rarity: 'rare',
    set: 'Origins',
    colors: ['Chaos'],
    cost: 5,
    effect: 'Deal 4 damage to any target. If you have 10 or more cards in your graveyard, deal 6 instead.',
    quantity: 1,
    foilQuantity: 1,
    hasFoil: true,
  },
  {
    cardId: 'OGN-057',
    name: 'Verdant Warden',
    type: 'Champion',
    rarity: 'epic',
    set: 'Origins',
    colors: ['Body'],
    cost: 6,
    might: 5,
    effect: 'Steadfast. At the start of your turn, heal 2 to your champion.',
    quantity: 1,
    foilQuantity: 0,
    notes: 'Pulled from a booster',
  },
  {
    cardId: 'OGN-099',
    name: 'Chaosrift Beacon',
    type: 'Relic',
    rarity: 'uncommon',
    set: 'Origins',
    colors: ['Chaos', 'Fury'],
    cost: 2,
    effect: 'Activate: Add one mana of any color.',
    quantity: 3,
    foilQuantity: 0,
  },
];

export const seed: Seed = {
  name: '001_dev_sample_cards',
  async run() {
    // Upsert the demo user
    let userId: string;
    const existing = await UserModel.findOne({ googleId: SEED_GOOGLE_ID }).lean().exec();

    if (existing) {
      userId = existing._id;
    } else {
      userId = uuidv4();
      await UserModel.create({
        _id:      userId,
        googleId: SEED_GOOGLE_ID,
        email:    'demo@rift-atelier.dev',
        name:     'Demo Collector',
        avatarUrl: null,
      });
    }

    // Upsert sample cards (idempotent on cardId + userId)
    let inserted = 0;
    for (const card of SAMPLE_CARDS) {
      const now = new Date();
      const result = await CardModel.updateOne(
        { cardId: card.cardId, userId },
        {
          $setOnInsert: {
            _id:          uuidv4(),
            userId,
            cardId:       card.cardId,
            name:         card.name,
            type:         card.type ?? '',
            rarity:       card.rarity ?? '',
            set:          card.set ?? '',
            colors:       card.colors ?? [],
            cost:         card.cost ?? null,
            might:        card.might ?? null,
            effect:       card.effect ?? '',
            flavorText:   '',
            supertype:    null,
            tags:         [],
            imageUrl:     '',
            hasFoil:      card.hasFoil ?? false,
            promo:        false,
            banned:       false,
            quantity:     card.quantity ?? 1,
            foilQuantity: card.foilQuantity ?? 0,
            notes:        card.notes ?? '',
            createdAt:    now,
            updatedAt:    now,
          },
        },
        { upsert: true }
      );
      if (result.upsertedCount > 0) inserted++;
    }

    console.log(
      `[001] Demo user "${SEED_GOOGLE_ID}" ready — ${inserted} card(s) inserted, ${SAMPLE_CARDS.length - inserted} already existed`
    );
  },
};
