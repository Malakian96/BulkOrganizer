import { Request, Response, NextFunction } from 'express';
import { mongoCatalogService } from '../../../infrastructure/catalog/MongoCatalogService';

export class CatalogController {
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const results = await mongoCatalogService.search(q);
      res.json(results);
    } catch (e) {
      next(e);
    }
  };

  listCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, set, type, rarity, colors } = req.query as Record<string, string | undefined>;
      const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
      const limit = Math.min(2000, Math.max(1, parseInt((req.query.limit as string) ?? '48', 10)));

      const result = await mongoCatalogService.findAll(
        {
          name,
          set,
          type,
          rarity,
          colors: colors ? colors.split(',') : undefined,
        },
        page,
        limit
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  getSets = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sets = await mongoCatalogService.getSets();
      res.json(sets);
    } catch (e) {
      next(e);
    }
  };

  stats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await mongoCatalogService.count();
      res.json({ cardCount: count });
    } catch (e) {
      next(e);
    }
  };
}
