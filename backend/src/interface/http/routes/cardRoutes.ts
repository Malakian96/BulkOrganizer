import { Router } from 'express';
import { CardController } from '../controllers/CardController';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import {
  createCardSchema,
  bulkEditSchema,
  removeCardsSchema,
  getCardsQuerySchema,
} from '../../dto/card.dto';

export function createCardRouter(controller: CardController): Router {
  const router = Router();
  router.get('/', validateQuery(getCardsQuerySchema), controller.listCards);
  router.post('/', validateBody(createCardSchema), controller.createCard);
  router.delete('/', validateBody(removeCardsSchema), controller.removeCards);
  router.patch('/bulk-edit', validateBody(bulkEditSchema), controller.bulkEditCards);
  return router;
}
