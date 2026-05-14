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
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-•/. ',
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
}

export async function extractCardId(base64Image: string): Promise<OcrResult> {
  const data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const inputBuf = Buffer.from(data, 'base64');

  const resizedBuf = await sharp(inputBuf)
    .resize(900, null, { withoutEnlargement: true })
    .toBuffer();

  const { width: w = 900, height: h = 675 } = await sharp(resizedBuf).metadata();

  const cropW = Math.round(w * 0.38);
  const cropH = Math.round(h * 0.24);

  const processedBuf = await sharp(resizedBuf)
    .extract({ left: 0, top: h - cropH, width: cropW, height: cropH })
    .grayscale()
    .normalize()
    .sharpen()
    .resize(cropW * 3, cropH * 3, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const worker = await getWorker();
  const { data: { text } } = await worker.recognize(processedBuf);

  const rawText = text.trim();

  // Match "SFD • 046/221" — bullet may OCR as any non-alphanumeric char
  const match = rawText.match(/([A-Z]{2,5})\W{0,5}(\d{3})\/\d{3}/);
  if (!match) return { rawText, extracted: null };

  return { rawText, extracted: { setAbbr: match[1], number: match[2] } };
}
