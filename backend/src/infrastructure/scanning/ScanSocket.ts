import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { extractCardName } from '../ocr/cardOcr';
import { mongoCatalogService, CatalogCard } from '../catalog/MongoCatalogService';

export interface ScanResultPayload {
  candidates: CatalogCard[];
  ocrText: string;
  debug: {
    processedImageB64: string;
    brightness: number;
    query: string;
  };
}

export class ScanSocket {
  private io: SocketIOServer;

  constructor(httpServer: HttpServer, corsOrigin: string) {
    this.io = new SocketIOServer(httpServer, {
      cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
      maxHttpBufferSize: 2e6,
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`[ScanSocket] connected: ${socket.id}`);
      socket.on('scan:frame', (frameB64: string) => {
        void this.handleFrame(socket, frameB64);
      });
      socket.on('disconnect', (reason) => {
        console.log(`[ScanSocket] disconnected: ${socket.id} (${reason})`);
      });
    });
  }

  private async handleFrame(socket: Socket, frameB64: string): Promise<void> {
    try {
      const { rawText, brightness, processedImageB64 } = await extractCardName(frameB64);
      const query = rawText.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
      const candidates = query.length >= 2
        ? await mongoCatalogService.search(query, 5)
        : [];

      socket.emit('scan:result', {
        candidates,
        ocrText: rawText,
        debug: { processedImageB64, brightness, query },
      } satisfies ScanResultPayload);
    } catch (err) {
      console.error('[ScanSocket] frame error:', err);
      socket.emit('scan:result', {
        candidates: [],
        ocrText: '',
        debug: { processedImageB64: '', brightness: 0, query: '' },
      } satisfies ScanResultPayload);
    }
  }
}
