import express from 'express';
import cors from 'cors';
import { CardController } from './controllers/CardController';
import { CatalogController } from './controllers/CatalogController';
import { ScanController } from './controllers/ScanController';
import { AuthController } from './controllers/AuthController';
import { createCardRouter } from './routes/cardRoutes';
import { createCatalogRouter } from './routes/catalogRoutes';
import { createScanRouter } from './routes/scanRoutes';
import { createAuthRouter } from './routes/authRoutes';
import { authenticate } from './middleware/authenticate';
import { errorHandler } from './middleware/errorHandler';
import { env } from '../../infrastructure/config/env';

export function createApp(
  cardController: CardController,
  catalogController: CatalogController,
  scanController: ScanController,
  authController: AuthController,
) {
  const app = express();
  // Increase limit for base64 image payloads (~4MB covers a 3MP JPEG)
  app.use(express.json({ limit: '5mb' }));
  app.use(cors({ origin: env.CORS_ORIGIN }));

  // Public routes
  app.use('/auth', createAuthRouter(authController));
  app.use('/api/catalog', createCatalogRouter(catalogController));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Protected routes
  app.use('/api/cards', authenticate, createCardRouter(cardController));
  app.use('/api/scan',  authenticate, createScanRouter(scanController));

  app.use(errorHandler);
  return app;
}
