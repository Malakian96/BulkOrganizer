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
  rawText: string;       // raw Tesseract output, no processing
  compressedText: string; // after collapsing inter-digit spaces
  extracted: ExtractedId | null;
  darkBackground: boolean;
  brightness: number;    // mean brightness of grayscale crop (0-255)
  processedImageB64: string; // the exact image sent to Tesseract, as data URI
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

  const cropW = Math.round(w * 0.55);
  const cropH = Math.round(h * 0.22);

  const grayscaleBuf = await sharp(resizedBuf)
    .extract({ left: 0, top: h - cropH, width: cropW, height: cropH })
    .grayscale()
    .normalize()
    .toBuffer();

  const { channels } = await sharp(grayscaleBuf).stats();
  const brightness = Math.round(channels[0].mean);
  const darkBackground = brightness < 128;

  const processedBuf = await sharp(grayscaleBuf)
    .linear(darkBackground ? -1 : 1, darkBackground ? 255 : 0)
    .threshold(140)
    .resize(cropW * 4, cropH * 4, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const rawText = await ocrCrop(processedBuf);
  const compressedText = rawText.replace(/(\d)\s+(?=[\d/])/g, '$1');

  const match = compressedText.match(/([A-Z]{2,5})\W{0,5}(\d{3})\/\d{3}/);

  return {
    rawText,
    compressedText,
    extracted: match ? { setAbbr: match[1], number: match[2] } : null,
    darkBackground,
    brightness,
    processedImageB64: `data:image/png;base64,${processedBuf.toString('base64')}`,
  };
}
