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
  compressedText: string;
  extracted: ExtractedId | null;
  brightness: number;
  processedImageB64: string;
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

  // The card guide frame starts at ~19% from left (scan-frame is 62% wide, centered).
  // The ID text strip is the bottom ~15% of the frame height.
  // Start from x=15% to avoid the dark background on the left edge of the frame.
  const left   = Math.round(w * 0.15);
  const cropW  = Math.round(w * 0.35);  // covers the ID zone width with margin
  const cropH  = Math.round(h * 0.15);
  const top    = h - cropH;

  const grayscaleBuf = await sharp(resizedBuf)
    .extract({ left, top, width: cropW, height: cropH })
    .grayscale()
    .normalize()
    .toBuffer();

  const { channels } = await sharp(grayscaleBuf).stats();
  const brightness = Math.round(channels[0].mean);

  // The card ID strip has dark text on a light background — no inversion needed.
  // Just scale up so Tesseract has enough pixels to work with.
  const processedBuf = await sharp(grayscaleBuf)
    .resize(cropW * 4, cropH * 4, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const rawText = await ocrCrop(processedBuf);
  const compressedText = rawText.replace(/(\d)\s+(?=[\d/])/g, '$1');

  // Match "SFD • 046/221" — bullet may OCR as any non-alphanumeric chars
  const match = compressedText.match(/([A-Z]{2,5})\W{0,5}(\d{3})\/\d{3}/);

  return {
    rawText,
    compressedText,
    extracted: match ? { setAbbr: match[1], number: match[2] } : null,
    brightness,
    processedImageB64: `data:image/png;base64,${processedBuf.toString('base64')}`,
  };
}
