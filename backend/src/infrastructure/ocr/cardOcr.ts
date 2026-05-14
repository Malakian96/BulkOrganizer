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

export interface NameOcrResult {
  rawText: string;
  brightness: number;
  processedImageB64: string;
}

export async function extractCardName(base64Image: string): Promise<NameOcrResult> {
  const data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const inputBuf = Buffer.from(data, 'base64');

  const { width: fullW = 640, height: fullH = 480 } = await sharp(inputBuf).metadata();

  // Mirror the frontend guide overlay geometry:
  // scan-frame is 62% wide, centered, 2.5/3.5 aspect. Height may exceed
  // the display height and be clipped — clamp to fullH.
  const cardW = Math.round(fullW * 0.62);
  const cardH = Math.min(fullH, Math.round(cardW * (3.5 / 2.5)));
  const cardX = Math.round((fullW - cardW) / 2);
  const cardY = Math.max(0, Math.round((fullH - cardH) / 2));

  // Name banner sits at 50–68% of card height
  const left   = Math.max(0, cardX);
  const top    = Math.min(fullH - 1, Math.round(cardY + cardH * 0.50));
  const width  = Math.min(fullW - left, cardW);
  const height = Math.min(fullH - top, Math.round(cardH * 0.18));

  const grayBuf = await sharp(inputBuf)
    .extract({ left, top, width, height: Math.max(1, height) })
    .grayscale()
    .normalize()
    .toBuffer();

  const { channels } = await sharp(grayBuf).stats();
  const brightness = Math.round(channels[0].mean);

  const needsInvert = brightness < 128;
  const readyBuf = needsInvert
    ? await sharp(grayBuf).negate({ alpha: false }).toBuffer()
    : grayBuf;

  const processedBuf = await sharp(readyBuf)
    .resize(width * 4, Math.max(1, height) * 4, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const worker = await getWorker();
  // PSM 7 = single text line — best for a name banner
  await worker.setParameters({ tessedit_pageseg_mode: '7' as never });
  const { data: { text } } = await worker.recognize(processedBuf);
  // Restore default
  await worker.setParameters({ tessedit_pageseg_mode: '11' as never });

  return {
    rawText: text.trim(),
    brightness,
    processedImageB64: `data:image/png;base64,${processedBuf.toString('base64')}`,
  };
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

  const rawText = await (async () => {
    const worker = await getWorker();
    const { data: { text } } = await worker.recognize(processedBuf);
    return text.trim();
  })();
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
