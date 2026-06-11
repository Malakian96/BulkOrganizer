import { ScanCardIdCommand } from './ScanCardIdCommand';

export interface ExtractedCardId {
  setAbbr: string;
  number: string;
}

export interface CardIdOcrResult {
  rawText: string;
  compressedText: string;
  extracted: ExtractedCardId | null;
  brightness: number;
  processedImageB64: string;
}

// Ports implemented by infrastructure (cardOcr / MongoCatalogService) and
// wired in src/index.ts.
export type CardIdOcr = (image: string) => Promise<CardIdOcrResult>;

export interface CatalogCardLookup<TCard> {
  findBySetAndNumber(setAbbr: string, number: string): Promise<TCard | null>;
}

export interface ScanCardIdResult<TCard> {
  ocr: CardIdOcrResult;
  displayId: string | null;
  card: TCard | null;
}

export class ScanCardIdHandler<TCard> {
  constructor(
    private readonly ocr: CardIdOcr,
    private readonly catalog: CatalogCardLookup<TCard>
  ) {}

  async execute(cmd: ScanCardIdCommand): Promise<ScanCardIdResult<TCard>> {
    const ocr = await this.ocr(cmd.image);
    if (!ocr.extracted) return { ocr, displayId: null, card: null };

    const { setAbbr, number } = ocr.extracted;
    const card = await this.catalog.findBySetAndNumber(setAbbr, number);
    return { ocr, displayId: `${setAbbr}-${number}`, card };
  }
}
