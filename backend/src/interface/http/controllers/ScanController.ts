import { Request, Response, NextFunction } from 'express';
import { extractCardId } from '../../../infrastructure/ocr/cardOcr';
import { mongoCatalogService } from '../../../infrastructure/catalog/MongoCatalogService';

export class ScanController {
  scan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { image } = req.body as { image?: string };
      if (!image) {
        res.status(400).json({ error: 'image is required' });
        return;
      }

      const cardId = await extractCardId(image);
      if (!cardId) {
        res.json({ cardId: null, card: null });
        return;
      }

      const card = await mongoCatalogService.findByCardId(cardId);
      res.json({ cardId, card });
    } catch (e) {
      next(e);
    }
  };
}
