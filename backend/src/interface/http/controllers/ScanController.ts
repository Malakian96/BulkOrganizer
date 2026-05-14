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

      const extracted = await extractCardId(image);
      if (!extracted) {
        res.json({ cardId: null, card: null });
        return;
      }

      // Build a human-readable ID to return even when catalog lookup fails
      const displayId = `${extracted.setAbbr}-${extracted.number}`;
      const card = await mongoCatalogService.findBySetAndNumber(extracted.setAbbr, extracted.number);
      res.json({ cardId: card?.cardId ?? displayId, card });
    } catch (e) {
      next(e);
    }
  };
}
