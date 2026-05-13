import { Router } from 'express';
import { CatalogController } from '../controllers/CatalogController';

export function createCatalogRouter(controller: CatalogController): Router {
  const router = Router();
  router.get('/', controller.listCards);
  router.get('/search', controller.search);
  router.get('/sets', controller.getSets);
  router.get('/stats', controller.stats);
  return router;
}
