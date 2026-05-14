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

      const { rawText, compressedText, extracted, darkBackground, brightness, processedImageB64 } = await extractCardId(image);

      const debugBase = { rawText, compressedText, darkBackground, brightness, processedImageB64 };

      if (!extracted) {
        res.json({
          cardId: null,
          card: null,
          debug: { ...debugBase, matched: null, reason: 'No card ID pattern found in OCR output' },
        });
        return;
      }

      const displayId = `${extracted.setAbbr}-${extracted.number}`;
      const card = await mongoCatalogService.findBySetAndNumber(extracted.setAbbr, extracted.number);

      res.json({
        cardId: card?.cardId ?? displayId,
        card,
        debug: {
          ...debugBase,
          matched: displayId,
          setAbbr: extracted.setAbbr,
          number: extracted.number,
          reason: card ? 'Found in catalog' : 'Not found in catalog',
        },
      });
    } catch (e) {
      next(e);
    }
  };
}
