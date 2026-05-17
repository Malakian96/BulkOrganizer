import express from 'express';
import cors from 'cors';
import { CardController } from './controllers/CardController';
import { CatalogController } from './controllers/CatalogController';
import { ScanController } from './controllers/ScanController';
import { createCardRouter } from './routes/cardRoutes';
import { createCatalogRouter } from './routes/catalogRoutes';
import { createScanRouter } from './routes/scanRoutes';
import { errorHandler } from './middleware/errorHandler';
import { env } from '../../infrastructure/config/env';

export function createApp(
  cardController: CardController,
  catalogController: CatalogController,
  scanController: ScanController,
) {
  const app = express();
  // Increase limit for base64 image payloads (~4MB covers a 3MP JPEG)
  app.use(express.json({ limit: '5mb' }));
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use('/api/cards', createCardRouter(cardController));
  app.use('/api/catalog', createCatalogRouter(catalogController));
  app.use('/api/scan', createScanRouter(scanController));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use(errorHandler);
  return app;
}
