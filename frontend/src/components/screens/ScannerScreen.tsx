import { useState, useRef, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { DesignCard, mapCatalogCard } from '../../mockData';
import { LiveScanResult, CatalogCardResult } from '../../api/scanApi';
import { Icon } from '../shared/Icon';

interface ScannerScreenProps {
  cards: DesignCard[];
  onIncrement: (card: DesignCard) => void;
  onManualAdd: () => void;
}

type ScanPhase = 'idle' | 'processing' | 'locked' | 'adding';

interface HistoryEntry {
  key: string;
  cardId: string;
  name: string;
  imageUrl: string;
  count: number;
}

// Lock when the same cardId appears in ≥2 of the last 3 frames
const LOCK_WINDOW = 3;
const LOCK_THRESHOLD = 2;

function getTopId(buf: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const id of buf) {
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestN = 0;
  for (const [id, n] of counts) {
    if (n > bestN) { best = id; bestN = n; }
  }
  return bestN >= LOCK_THRESHOLD ? best : null;
}

export function ScannerScreen({ cards, onIncrement, onManualAdd }: ScannerScreenProps) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const socketRef  = useRef<Socket | null>(null);
  const lockBuf    = useRef<(string | null)[]>([]);
  const cardCache  = useRef<Map<string, CatalogCardResult>>(new Map());

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [phase, setPhase]             = useState<ScanPhase>('idle');
  const [lockedCard, setLockedCard]   = useState<CatalogCardResult | null>(null);
  const [lastDebug, setLastDebug]     = useState<LiveScanResult['debug'] | null>(null);
  const [lastOcrText, setLastOcrText] = useState('');
  const [history, setHistory]         = useState<HistoryEntry[]>([]);

  // ── Camera ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } } })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          void videoRef.current.play();
        }
      })
      .catch(() => setCameraError('Camera access denied — allow permissions and refresh.'));
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  // ── Socket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('scan:result', (result: LiveScanResult) => {
      setLastDebug(result.debug);
      setLastOcrText(result.ocrText);

      const topId = result.candidates[0]?.cardId ?? null;
      if (topId && result.candidates[0]) {
        cardCache.current.set(topId, result.candidates[0]);
      }

      lockBuf.current = [...lockBuf.current, topId].slice(-LOCK_WINDOW);
      const lockedId = getTopId(lockBuf.current);

      if (lockedId) {
        const card = cardCache.current.get(lockedId) ?? null;
        if (card) {
          setLockedCard(card);
          setPhase('locked');
          return;
        }
      }

      setPhase('idle');
    });

    return () => { socket.disconnect(); };
  }, []);

  // ── Frame capture ────────────────────────────────────────────────────────
  const sendFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const socket = socketRef.current;
    if (!video || !canvas || !socket?.connected) return;

    const displayW = video.clientWidth  || 640;
    const displayH = video.clientHeight || 480;
    const streamW  = video.videoWidth   || 640;
    const streamH  = video.videoHeight  || 480;

    const scale = Math.max(displayW / streamW, displayH / streamH);
    const srcW  = displayW / scale;
    const srcH  = displayH / scale;
    const srcX  = (streamW - srcW) / 2;
    const srcY  = (streamH - srcH) / 2;

    canvas.width  = displayW;
    canvas.height = displayH;
    canvas.getContext('2d')?.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, displayW, displayH);

    socket.emit('scan:frame', canvas.toDataURL('image/jpeg', 0.7));
    setPhase('processing');
  }, []);

  // ── Server-paced loop: fire when idle ────────────────────────────────────
  useEffect(() => {
    if (phase === 'idle') {
      const id = requestAnimationFrame(() => sendFrame());
      return () => cancelAnimationFrame(id);
    }
  }, [phase, sendFrame]);

  // ── Add card ─────────────────────────────────────────────────────────────
  const doAdd = useCallback(() => {
    if (!lockedCard) return;
    setPhase('adding');

    const inCollection = cards.find(c => c.cardId === lockedCard.cardId);
    const designCard = inCollection ?? mapCatalogCard(lockedCard, 0, new Set(), new Set());
    onIncrement(designCard);

    setHistory(prev => {
      const idx = prev.findIndex(e => e.cardId === lockedCard.cardId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + 1 };
        return next;
      }
      return [
        { key: String(Date.now()), cardId: lockedCard.cardId, name: lockedCard.name, imageUrl: lockedCard.imageUrl, count: 1 },
        ...prev,
      ].slice(0, 20);
    });

    setTimeout(resetToIdle, 800);
  }, [lockedCard, cards, onIncrement]);

  const resetToIdle = () => {
    lockBuf.current = [];
    setLockedCard(null);
    setLastDebug(null);
    setLastOcrText('');
    setPhase('idle');
  };

  const owned = lockedCard ? (cards.find(c => c.cardId === lockedCard.cardId)?.owned ?? 0) : 0;

  return (
    <>
      <div className="section-head">
        <div><h2>Scanner</h2></div>
        <div className="meta">{history.length} added this session</div>
      </div>

      <div className="scanner-layout">
        <div>
          <div className={`scanner-view-wrap${phase === 'processing' ? ' scanner-view-wrap--scanning' : ''}`}>
            {cameraError ? (
              <div className="scanner-nocam">
                <Icon name="camera" size={36} />
                <p>{cameraError}</p>
              </div>
            ) : (
              <>
                <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Scanning guide — visible while reading */}
                {(phase === 'idle' || phase === 'processing') && (
                  <div className="scan-overlay" aria-hidden="true">
                    <div className="scan-frame">
                      <div className="scan-name-zone">
                        <span className="scan-id-label">Card Name</span>
                      </div>
                    </div>
                    <div className="scanner-hint">
                      {phase === 'processing' ? 'Reading…' : 'Point camera at card'}
                    </div>
                  </div>
                )}

                {/* Locked result overlay */}
                {(phase === 'locked' || phase === 'adding') && lockedCard && (
                  <div className="scan-overlay scan-locked-overlay">
                    <div className="scan-locked-card">
                      {lockedCard.imageUrl && (
                        <img src={lockedCard.imageUrl} alt={lockedCard.name} className="scan-locked-img" />
                      )}
                      <div className="scan-locked-info">
                        <div className="scan-locked-name">{lockedCard.name}</div>
                        <div className="scan-locked-sub">
                          {lockedCard.cardId} · {lockedCard.type} ·{' '}
                          <span style={{ textTransform: 'capitalize' }}>{lockedCard.rarity}</span>
                        </div>
                        {owned > 0 && <div className="scan-owned-tag">{owned} in collection</div>}
                      </div>
                    </div>

                    {phase === 'locked' && (
                      <div className="scan-locked-actions">
                        <button className="btn primary" onClick={doAdd}>
                          <Icon name="plus" size={14} /> Add to Collection
                        </button>
                        <button className="btn ghost" onClick={resetToIdle}>
                          <Icon name="x" size={14} /> Dismiss
                        </button>
                      </div>
                    )}

                    {phase === 'adding' && (
                      <div className="scan-adding-feedback">
                        <span>✓ Added!</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Debug panel */}
          {lastDebug && (
            <div className="scan-result-area">
              <details className="scan-debug" open>
                <summary>Debug</summary>
                {lastDebug.processedImageB64 && (
                  <div className="scan-debug-img-wrap">
                    <div className="scan-debug-img-label">Image sent to Tesseract</div>
                    <img src={lastDebug.processedImageB64} alt="OCR input" className="scan-debug-img" />
                  </div>
                )}
                <div className="scan-debug-row"><span>OCR text</span><code>{lastOcrText || '(empty)'}</code></div>
                <div className="scan-debug-row"><span>Query</span><code>{lastDebug.query || '(empty)'}</code></div>
                <div className="scan-debug-row"><span>Brightness</span><code>{lastDebug.brightness}/255</code></div>
                <div className="scan-debug-row"><span>Phase</span><code>{phase}</code></div>
              </details>
            </div>
          )}
        </div>

        {/* History sidebar */}
        <div className="scan-history">
          <div className="scan-history-head">Recent Scans</div>
          {history.length === 0 ? (
            <div className="scan-history-empty">
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink-300)' }}>始</div>
              <p>Scans appear here automatically</p>
            </div>
          ) : (
            <div className="scan-history-list">
              {history.map(e => (
                <div key={e.key} className="scan-history-item">
                  <div className="scan-history-thumb">
                    {e.imageUrl && <img src={e.imageUrl} alt={e.name} />}
                  </div>
                  <div className="scan-history-info">
                    <div className="scan-history-name">{e.name}</div>
                    <div className="scan-history-id">{e.cardId}</div>
                  </div>
                  <div className="scan-history-count">×{e.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
