import { Request, Response, NextFunction } from 'express';
import { ScanCardIdHandler } from '../../../application/scan/ScanCardId/ScanCardIdHandler';
import { CatalogCard } from '../../../infrastructure/catalog/MongoCatalogService';

export class ScanController {
  constructor(private readonly scanCardIdHandler: ScanCardIdHandler<CatalogCard>) {}

  scan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { image } = req.body as { image?: string };
      if (!image) {
        res.status(400).json({ error: 'image is required' });
        return;
      }

      const { ocr, displayId, card } = await this.scanCardIdHandler.execute({ image });
      const debugBase = {
        rawText: ocr.rawText,
        compressedText: ocr.compressedText,
        brightness: ocr.brightness,
        processedImageB64: ocr.processedImageB64,
      };

      if (!ocr.extracted) {
        res.json({
          cardId: null,
          card: null,
          debug: { ...debugBase, matched: null, reason: 'No card ID pattern found in OCR output' },
        });
        return;
      }

      res.json({
        cardId: card?.cardId ?? displayId,
        card,
        debug: {
          ...debugBase,
          matched: displayId,
          setAbbr: ocr.extracted.setAbbr,
          number: ocr.extracted.number,
          reason: card ? 'Found in catalog' : 'Not found in catalog',
        },
      });
    } catch (e) {
      next(e);
    }
  };
}
