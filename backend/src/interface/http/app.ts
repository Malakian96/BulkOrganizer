import express from 'express';
import cors from 'cors';
import { CardController } from './controllers/CardController';
import { CatalogController } from './controllers/CatalogController';
import { createCardRouter } from './routes/cardRoutes';
import { createCatalogRouter } from './routes/catalogRoutes';
import { errorHandler } from './middleware/errorHandler';
import { env } from '../../infrastructure/config/env';

export function createApp(cardController: CardController, catalogController: CatalogController) {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use('/api/cards', createCardRouter(cardController));
  app.use('/api/catalog', createCatalogRouter(catalogController));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use(errorHandler);
  return app;
}
