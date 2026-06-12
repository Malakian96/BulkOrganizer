# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

Rift Atelier (BulkOrganizer) is a card collection manager for the Riftbound TCG. It lets users add cards, track quantities, bulk-edit their collection, and browse a full card catalog. The catalog is populated separately by the [RiftboundScraper](../RiftboundScraper) project, which writes into the same MongoDB instance.

## Commands

All primary commands are run from the repo root via Docker Compose.

```bash
# Start the full dev stack (MongoDB + backend on :4000 + frontend on :5173, with hot reload)
npm run dev

# Stop the dev stack
npm run dev:down

# Tail container logs
npm run logs

# Build production containers (nginx on :80, proxies /api/ to backend)
npm start
npm stop

# Install dependencies locally (only needed outside Docker)
npm run install:all
```

**Backend only** (inside `backend/`):
```bash
npm run dev     # ts-node-dev with hot reload
npm run build   # tsc compile to dist/
npm start       # run compiled output
```

**Frontend only** (inside `frontend/`):
```bash
npm run dev     # Vite dev server
npm run build   # tsc + vite build
npm run lint    # ESLint
npm test        # Vitest (jsdom; tests in src/__tests__/)
```

**Backend tests** (inside `backend/`): `npm test` runs Jest (domain unit tests in `src/__tests__/`).

## Architecture

### Backend — Domain-Driven Design (DDD)

The backend is a strict 4-layer DDD application. Each layer has a one-way dependency:

```
interface → application → domain ← infrastructure
```

- **`domain/card/`** — `Card` entity (private constructor, `create()` / `reconstitute()` factory pattern), `CardId` and `CardName` value objects, and `ICardRepository` interface. Domain invariants (e.g. quantity ≥ 0) throw `DomainError`.
- **`application/card/`**, **`application/scan/`** — One folder per use case (AddCard, RemoveCard, BulkEditCards, GetCards, ScanCardId). Each folder contains a Command/Query object and a Handler class. Handlers throw `ApplicationError` for business-rule violations (e.g. "Card not found"). `ScanCardIdHandler` declares its dependencies as ports (an OCR function and a catalog lookup) so the application layer stays free of infrastructure imports.
- **`infrastructure/`** — `MongoCardRepository` implements `ICardRepository`. `CardMapper` translates between `Card` domain objects and `ICardDocument` Mongoose documents. `MongoCatalogService` (a plain service object, not a repository) handles read-only access to the scraped catalog collection. The shared filter→Mongo-query translation lives in `persistence/buildCardQuery.ts`. `ocr/cardOcr.ts` runs Tesseract.js (with sharp preprocessing) for card-name and card-ID OCR; `scanning/ScanSocket.ts` is the Socket.IO server for the live scanner (`scan:frame` in, `scan:result` out).
- **`interface/http/`** — Express controllers receive DTOs, call handlers, map results back to `CardResponseDTO`. `validateBody` / `validateQuery` middleware uses Zod schemas. `errorHandler` maps `DomainError`/`ApplicationError` → HTTP 422, everything else → HTTP 500. `/api/scan` exposes one-shot card-ID OCR.

Dependency injection is manual and wired in `src/index.ts`: the repository is instantiated, injected into handlers, handlers injected into the controller, controller passed to `createApp()`. `index.ts` also attaches `ScanSocket` to the HTTP server and handles SIGINT/SIGTERM for graceful shutdown.

### Two MongoDB Collections

| Collection | Owner | Description |
|---|---|---|
| `cards` | This app | Collection entries: `{ cardId, quantity, foilQuantity, notes }` — managed via `MongoCardRepository` |
| `catalog` (or similar) | RiftboundScraper | Read-only reference data — queried by `MongoCatalogService` |

The catalog collection is never written by this app. If it's empty, the Catalog tab shows nothing.

**Collection entries don't store card facts.** An entry only references a `cardId`; name/cost/rarity/etc. are joined from the catalog at read time in `CardController` (via `mongoCatalogService.findByCardIds`), so scraper updates flow through automatically. `AddCardHandler` rejects cardIds that don't exist in the catalog and merges quantities when the card is already owned. An idempotent startup migration (`infrastructure/persistence/migrations.ts`) dedupes and strips legacy fat documents.

### Frontend — React + Vite + Tailwind

The frontend is a single-page app with a sidebar navigation and tab-based routing (no React Router — just a `tab` state variable in `App.tsx`).

**Key data flow:**

1. `useCards` hook owns all collection state and exposes typed CRUD operations (`addCard`, `editCards`, `deleteCards`). It keeps the local state in sync optimistically after each API call rather than re-fetching. Bulk-selection state lives in `App.tsx`, not the hook.
2. `useLocalPrefs` stores wishlist and favorites in `localStorage` (keys: `rift-wishlist`, `rift-favorites`) as `Set<string>` of `cardId` values — these are never persisted to the backend.
3. `App.tsx` merges `CardDTO[]` from the API with wishlist/favorites state into `DesignCard[]` via `mapCardDTO` in `mockData.ts`. `DesignCard` is the unified format consumed by all UI components.
4. `CatalogScreen` / `useCatalog` independently fetches catalog data from `/api/catalog`. The `collectionMap` (a `Map<cardId, quantity>`) built in `App.tsx` is passed down to show "owned" counts in the catalog view.

**`DesignCard` vs `CardDTO`:** `CardDTO` is the raw API response shape. `DesignCard` is the UI-layer type that normalizes colors → a single `domain` string (body/mind/calm/chaos/order/fury), normalizes rarity to lowercase, and adds `wishlist`, `fav`, `owned`, and `sourceType` fields. The `colorsToDomain` function in `mockData.ts` handles the color→domain mapping.

**Scanner:** `ScannerScreen` captures camera frames and streams them over Socket.IO (`scan:frame`/`scan:result`) to the backend, which OCRs the card name (falling back to the bottom-left card ID) and returns catalog candidates. It connects to `VITE_API_URL` when set, otherwise same-origin — so `/socket.io` must be proxied: Vite does this in dev (`VITE_PROXY_TARGET` points it at the backend container inside Docker), nginx does it in production.

**Screens that are stubs:** Decks renders hardcoded `MOCK_DECKS` only. The Storage binder items in the sidebar are hardcoded mocks.

### Environment Variables

Backend reads from environment (validated via Zod at startup in `infrastructure/config/env.ts`):
- `MONGODB_URI` — required
- `PORT` — default `4000`
- `NODE_ENV` — default `development`
- `CORS_ORIGIN` — default `http://localhost:5173`

Frontend uses `VITE_API_URL` at build time. In dev, Vite proxies `/api`, `/health`, and `/socket.io` to `VITE_PROXY_TARGET` (default `http://localhost:4000`; set to `http://backend:4000` in docker-compose.dev.yml). In production, nginx proxies the same paths to `BACKEND_URL` (set in docker-compose.yml).

## Key Conventions

- **New use cases** follow the folder-per-use-case pattern: create `Command.ts` + `Handler.ts` under `application/card/<UseCaseName>/`.
- **Domain errors** (invariant violations): throw `DomainError`. **Application errors** (entity not found, business rules): throw `ApplicationError`. Both are caught by the global `errorHandler` and return HTTP 422.
- The `Card` entity uses `_id` as its MongoDB `_id` (type `String`, not `ObjectId`). UUIDs are generated by `CardId.create()`. The Mongoose schema has `_id: false` in options and defines `_id` explicitly.
- Frontend API calls live in `frontend/src/api/` and are thin typed wrappers over `fetch`. They throw on non-OK responses.
