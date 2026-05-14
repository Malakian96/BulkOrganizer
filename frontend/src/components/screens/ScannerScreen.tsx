import { useState, useRef, useEffect, useCallback } from 'react';
import { DesignCard, mapCatalogCard, colorsToDomain, normalizeRarity } from '../../mockData';
import { scanCard, ScanResult } from '../../api/scanApi';
import { Icon } from '../shared/Icon';

interface ScannerScreenProps {
  cards: DesignCard[];
  onIncrement: (card: DesignCard) => void;
  onManualAdd: () => void;
}

type Phase = 'live' | 'processing' | 'result';

interface HistoryEntry {
  key: string;
  cardId: string;
  name: string;
  imageUrl: string;
  count: number;
}

export function ScannerScreen({ cards, onIncrement, onManualAdd }: ScannerScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('live');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [confirmMode, setConfirmMode] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

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

  const handleShutter = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || phase !== 'live') return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    setPhase('processing');
    setResult(null);
    setConfirmMode(false);

    try {
      const b64 = canvas.toDataURL('image/jpeg', 0.85);
      const r = await scanCard(b64);
      setResult(r);
    } catch {
      setResult({ cardId: null, card: null });
    }
    setPhase('result');
  }, [phase]);

  const doAdd = useCallback((r: ScanResult) => {
    if (!r.card) return;
    const inCollection = cards.find(c => c.cardId === r.card!.cardId);
    const designCard = inCollection ?? mapCatalogCard(
      { ...r.card, power: null, supertype: null, might: null, hasFoil: false, promo: false, banned: false, flavorText: '' },
      0, new Set(), new Set(),
    );
    onIncrement(designCard);

    setHistory(prev => {
      const idx = prev.findIndex(e => e.cardId === r.card!.cardId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + 1 };
        return next;
      }
      return [{ key: String(Date.now()), cardId: r.card!.cardId, name: r.card!.name, imageUrl: r.card!.imageUrl, count: 1 }, ...prev].slice(0, 20);
    });

    setPhase('live');
    setResult(null);
    setConfirmMode(false);
  }, [cards, onIncrement]);

  const retry = () => { setPhase('live'); setResult(null); setConfirmMode(false); };

  const rc = result?.card;
  const owned = rc ? (cards.find(c => c.cardId === rc.cardId)?.owned ?? 0) : 0;

  return (
    <>
      <div className="section-head">
        <div><h2>Scanner</h2></div>
        <div className="meta">{history.length} added this session</div>
      </div>

      <div className="scanner-layout">
        {/* ── Main column ── */}
        <div>
          <div className="scanner-view-wrap">
            {cameraError ? (
              <div className="scanner-nocam">
                <Icon name="camera" size={36} />
                <p>{cameraError}</p>
              </div>
            ) : (
              <>
                <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Guide overlay — visible only while live */}
                {phase === 'live' && (
                  <div className="scan-overlay" aria-hidden="true">
                    {/* Card-sized frame */}
                    <div className="scan-frame" />
                    {/* Highlight the bottom-left ID region */}
                    <div className="scan-id-zone">
                      <span className="scan-id-label">Card ID</span>
                    </div>
                    <div className="scanner-hint">Point at card · ID in bottom-left corner</div>
                  </div>
                )}

                {/* Processing overlay */}
                {phase === 'processing' && (
                  <div className="scan-overlay scan-processing">
                    <div className="scan-spinner" />
                    <span>Reading card…</span>
                  </div>
                )}

                {/* Shutter — only when live */}
                {phase === 'live' && (
                  <button className="shutter" onClick={() => void handleShutter()} aria-label="Capture" />
                )}
              </>
            )}
          </div>

          {/* ── Result strip ── */}
          {phase === 'result' && result && (
            <div className="scan-result-area">
              {rc ? (
                confirmMode ? (
                  /* Detail / confirm view */
                  <div className="scan-detail">
                    {rc.imageUrl
                      ? <img src={rc.imageUrl} alt={rc.name} className="scan-detail-img" />
                      : <div className="scan-detail-img scan-detail-img--placeholder" />}
                    <div className="scan-detail-info">
                      <div className="scan-detail-name">{rc.name}</div>
                      <div className="scan-detail-sub">
                        {rc.cardId} · {rc.type} · <span style={{ textTransform: 'capitalize' }}>{rc.rarity}</span>
                      </div>
                      {owned > 0 && <div className="scan-owned-tag">{owned} in collection</div>}
                      <div className="scan-detail-actions">
                        <button className="btn primary sm" onClick={() => doAdd(result)}>
                          <Icon name="plus" size={13} />
                          Add to Collection
                        </button>
                        <button className="btn ghost sm" onClick={retry}>
                          <Icon name="x" size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Quick strip */
                  <div className="scan-quick">
                    {rc.imageUrl
                      ? <img src={rc.imageUrl} alt={rc.name} className="scan-quick-thumb" />
                      : <div className="scan-quick-thumb scan-quick-thumb--placeholder" />}
                    <div className="scan-quick-info">
                      <div className="scan-quick-name">{rc.name}</div>
                      <div className="scan-quick-sub">
                        {rc.cardId}{owned > 0 ? ` · ${owned} owned` : ' · not owned'}
                      </div>
                    </div>
                    <div className="scan-quick-actions">
                      <button className="btn primary sm" onClick={() => doAdd(result)}>
                        <Icon name="plus" size={13} /> Add
                      </button>
                      <button className="btn ghost sm" onClick={() => setConfirmMode(true)}>Details</button>
                      <button className="btn ghost sq sm" onClick={retry}><Icon name="x" size={13} /></button>
                    </div>
                  </div>
                )
              ) : result.cardId ? (
                /* ID read but not in catalog */
                <div className="scan-feedback">
                  <div className="scan-id-badge">{result.cardId}</div>
                  <div className="scan-msg">Not found in catalog</div>
                  <div className="scan-actions-row">
                    <button className="btn sm" onClick={onManualAdd}>Add manually</button>
                    <button className="btn ghost sm" onClick={retry}>Retry</button>
                  </div>
                </div>
              ) : (
                /* OCR failed */
                <div className="scan-feedback">
                  <div className="scan-msg">Couldn't read card ID</div>
                  <div className="scan-hint">Align the bottom-left corner in the red guide box</div>
                  <button className="btn sm" onClick={retry}>Try again</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── History column ── */}
        <div className="scan-history">
          <div className="scan-history-head">Recent Scans</div>
          {history.length === 0 ? (
            <div className="scan-history-empty">
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink-300)' }}>始</div>
              <p>Tap the shutter to log a card</p>
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
