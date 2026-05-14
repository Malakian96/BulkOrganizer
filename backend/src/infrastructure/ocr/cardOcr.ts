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
      // PSM 11 = sparse text — finds text anywhere, tolerates surrounding noise
      tessedit_pageseg_mode: '11' as never,
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

  // Frontend already crops to the scan-id-zone; just resize to a standard width
  // so Tesseract has enough pixels regardless of device resolution.
  const resizedBuf = await sharp(inputBuf)
    .resize(600, null, { withoutEnlargement: false })
    .toBuffer();

  const { width: w = 600, height: h = 200 } = await sharp(resizedBuf).metadata();

  const grayscaleBuf = await sharp(resizedBuf)
    .grayscale()
    .normalize()
    .toBuffer();

  const { channels } = await sharp(grayscaleBuf).stats();
  const brightness = Math.round(channels[0].mean);

  // Invert if text is white-on-dark so Tesseract gets dark-text-on-white.
  const needsInvert = brightness < 128;
  const invertedBuf = needsInvert
    ? await sharp(grayscaleBuf).negate({ alpha: false }).toBuffer()
    : grayscaleBuf;

  const processedBuf = await sharp(invertedBuf)
    .resize(w * 3, h * 3, { kernel: 'lanczos3' })
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
