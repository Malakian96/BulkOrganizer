import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import sharp from 'sharp';

let _worker: Worker | null = null;
let _initPromise: Promise<Worker> | null = null;

function getWorker(): Promise<Worker> {
  if (_worker) return Promise.resolve(_worker);
  if (_initPromise) return _initPromise;

  _initPromise = createWorker('eng').then(async w => {
    await w.setParameters({
      // PSM 7 = single text line — best for short IDs like "SFD • 046/221"
      tessedit_pageseg_mode: '7' as never,
      // No whitelist — it forces wrong substitutions and hurts accuracy
    });
    _worker = w;
    _initPromise = null;
    return w;
  });

  return _initPromise;
}

export function warmUpOcr(): void {
  void getWorker();
}

export interface ExtractedId {
  setAbbr: string;
  number: string;
}

export interface OcrResult {
  rawText: string;
  extracted: ExtractedId | null;
  darkBackground: boolean;
}

async function ocrCrop(buf: Buffer): Promise<string> {
  const worker = await getWorker();
  const { data: { text } } = await worker.recognize(buf);
  return text.trim();
}

export async function extractCardId(base64Image: string): Promise<OcrResult> {
  const data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const inputBuf = Buffer.from(data, 'base64');

  const resizedBuf = await sharp(inputBuf)
    .resize(900, null, { withoutEnlargement: true })
    .toBuffer();

  const { width: w = 900, height: h = 675 } = await sharp(resizedBuf).metadata();

  // Wider crop to safely capture the full bottom ID line
  const cropW = Math.round(w * 0.55);
  const cropH = Math.round(h * 0.22);

  const grayscaleBuf = await sharp(resizedBuf)
    .extract({ left: 0, top: h - cropH, width: cropW, height: cropH })
    .grayscale()
    .normalize()
    .toBuffer();

  // Auto-detect background brightness — card text is usually white on dark
  const { channels } = await sharp(grayscaleBuf).stats();
  const darkBackground = channels[0].mean < 128;

  // Tesseract works best with dark text on white; invert if background is dark
  const binaryBuf = await sharp(grayscaleBuf)
    .linear(darkBackground ? -1 : 1, darkBackground ? 255 : 0) // invert if needed
    .threshold(140)
    .resize(cropW * 4, cropH * 4, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const rawText = await ocrCrop(binaryBuf);

  // Collapse spaces OCR inserts between digits: "0 4 6 / 2 2 1" → "046/221"
  const compressed = rawText.replace(/(\d)\s+(?=[\d/])/g, '$1');

  // Match "SFD • 046/221" — bullet may OCR as any non-alphanumeric chars
  const match = compressed.match(/([A-Z]{2,5})\W{0,5}(\d{3})\/\d{3}/);

  return {
    rawText,
    extracted: match ? { setAbbr: match[1], number: match[2] } : null,
    darkBackground,
  };
}
