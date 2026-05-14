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
      // Only expect characters that appear in card IDs
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
    });
    _worker = w;
    _initPromise = null;
    return w;
  });

  return _initPromise;
}

// Warm up the worker at startup so the first scan isn't slow
export function warmUpOcr(): void {
  void getWorker();
}

export async function extractCardId(base64Image: string): Promise<string | null> {
  const data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const inputBuf = Buffer.from(data, 'base64');

  // Resize to a predictable width to keep crop ratios consistent
  const resizedBuf = await sharp(inputBuf)
    .resize(900, null, { withoutEnlargement: true })
    .toBuffer();

  const { width: w = 900, height: h = 675 } = await sharp(resizedBuf).metadata();

  // Card IDs sit in the bottom-left ~38% × 24% of the card face
  const cropW = Math.round(w * 0.38);
  const cropH = Math.round(h * 0.24);

  const processedBuf = await sharp(resizedBuf)
    .extract({ left: 0, top: h - cropH, width: cropW, height: cropH })
    .grayscale()
    .normalize()
    .sharpen()
    // Scale up 3× so Tesseract has more pixels to work with
    .resize(cropW * 3, cropH * 3, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const worker = await getWorker();
  const { data: { text } } = await worker.recognize(processedBuf);

  // Match pattern like OGN-179, SFD-042, UNL-3
  // Spaces may appear in OCR output where the dash is
  const normalized = text.replace(/\s+/g, '');
  const match = normalized.match(/[A-Z]{2,5}-?\d{1,4}/);
  if (!match) return null;

  // Ensure there's a dash between letters and digits
  return match[0].replace(/([A-Z]+)(\d)/, '$1-$2');
}
