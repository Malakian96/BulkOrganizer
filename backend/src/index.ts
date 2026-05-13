import 'dotenv/config';
import { env } from './infrastructure/config/env';
import { mongoConnection } from './infrastructure/database/mongoConnection';
import { MongoCardRepository } from './infrastructure/persistence/MongoCardRepository';
import { AddCardHandler } from './application/card/AddCard/AddCardHandler';
import { RemoveCardHandler } from './application/card/RemoveCard/RemoveCardHandler';
import { BulkEditCardsHandler } from './application/card/BulkEditCards/BulkEditCardsHandler';
import { GetCardsHandler } from './application/card/GetCards/GetCardsHandler';
import { CardController } from './interface/http/controllers/CardController';
import { CatalogController } from './interface/http/controllers/CatalogController';
import { createApp } from './interface/http/app';

async function main() {
  await mongoConnection.connect(env.MONGODB_URI);

  const repo = new MongoCardRepository();
  const cardController = new CardController(
    new AddCardHandler(repo),
    new RemoveCardHandler(repo),
    new BulkEditCardsHandler(repo),
    new GetCardsHandler(repo)
  );
  const catalogController = new CatalogController();

  const app = createApp(cardController, catalogController);
  app.listen(Number(env.PORT), () => {
    console.log(`[Server] Listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

main().catch((err) => {
  console.error('[Fatal]', err);
  process.exit(1);
});
