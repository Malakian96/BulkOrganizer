import { Router } from 'express';
import { ScanController } from '../controllers/ScanController';

export function createScanRouter(controller: ScanController): Router {
  const router = Router();
  router.post('/', controller.scan);
  return router;
}
