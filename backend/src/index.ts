import 'dotenv/config';
import * as http from 'http';
import { env } from './infrastructure/config/env';
import { mongoConnection } from './infrastructure/database/mongoConnection';
import { MongoCardRepository } from './infrastructure/persistence/MongoCardRepository';
import { AddCardHandler } from './application/card/AddCard/AddCardHandler';
import { RemoveCardHandler } from './application/card/RemoveCard/RemoveCardHandler';
import { BulkEditCardsHandler } from './application/card/BulkEditCards/BulkEditCardsHandler';
import { GetCardsHandler } from './application/card/GetCards/GetCardsHandler';
import { CardController } from './interface/http/controllers/CardController';
import { CatalogController } from './interface/http/controllers/CatalogController';
import { ScanController } from './interface/http/controllers/ScanController';
import { ScanCardIdHandler } from './application/scan/ScanCardId/ScanCardIdHandler';
import { createApp } from './interface/http/app';
import { warmUpOcr, extractCardId } from './infrastructure/ocr/cardOcr';
import { mongoCatalogService } from './infrastructure/catalog/MongoCatalogService';
import { migrateCollectionEntries } from './infrastructure/persistence/migrations';
import { ScanSocket } from './infrastructure/scanning/ScanSocket';

async function main() {
  await mongoConnection.connect(env.MONGODB_URI);
  await migrateCollectionEntries();

  warmUpOcr();

  const repo = new MongoCardRepository();
  const cardController = new CardController(
    new AddCardHandler(repo, mongoCatalogService),
    new RemoveCardHandler(repo),
    new BulkEditCardsHandler(repo),
    new GetCardsHandler(repo),
    mongoCatalogService
  );
  const catalogController = new CatalogController();
  const scanController = new ScanController(
    new ScanCardIdHandler(extractCardId, mongoCatalogService)
  );

  const app = createApp(cardController, catalogController, scanController);

  const httpServer = http.createServer(app);
  const scanSocket = new ScanSocket(httpServer, env.CORS_ORIGIN);

  httpServer.listen(Number(env.PORT), () => {
    console.log(`[Server] Listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  let shuttingDown = false;
  async function shutdown(signal: string): Promise<void> {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[Server] ${signal} received — shutting down`);
    // Force-exit if connections refuse to drain
    setTimeout(() => process.exit(1), 10_000).unref();
    await scanSocket.close(); // also closes the shared HTTP server
    await mongoConnection.disconnect();
    process.exit(0);
  }

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[Fatal]', err);
  process.exit(1);
});
