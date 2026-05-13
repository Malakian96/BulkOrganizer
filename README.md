# Bulk Organizer

A card collection manager for Riftbound TCG. Add cards, track quantities, and bulk-edit your collection. Includes a full card catalog populated by the [RiftboundScraper](../RiftboundScraper) project.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js 22 · TypeScript · Express · DDD |
| Database | MongoDB 7 |
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS |
| Containers | Docker + Docker Compose |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
- Node.js 22+ (only needed for `npm run install:all`)

---

## Quick Start — Development

```bash
# 1. Clone / navigate to the project
cd "Side Projects/BulkOrganizer"

# 2. Start the full dev stack (MongoDB + backend + frontend with hot reload)
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| MongoDB | localhost:27017 |

Changes to `backend/src/` and `frontend/src/` reload automatically.

Stop the stack:
```bash
npm run dev:down
```

---

## Production

```bash
# Build and start production containers (nginx on port 80)
npm start

# Stop
npm stop
```

Open http://localhost — the React app is served by nginx, which proxies `/api/` to the backend.

---

## Populating the Card Catalog

The **Card Catalog** tab requires running the scraper first:

```bash
cd "../RiftboundScraper"
cp .env.example .env          # set MONGODB_URI=mongodb://localhost:27017/bulk_organizer
npm install
npx playwright install chromium
npm run scrape:headful         # browser opens — set "All Sets" filter, then press ENTER
```

Once the scraper finishes, the Catalog tab in the app will show all scraped cards with images, effects, and full metadata.

---

## Project Structure

```
BulkOrganizer/
├── backend/                  # Express API — DDD architecture
│   └── src/
│       ├── domain/           # Card entity, value objects, repository interface
│       ├── application/      # Use case handlers (AddCard, RemoveCard, BulkEdit, GetCards)
│       ├── infrastructure/   # MongoDB repository, catalog service, env config
│       └── interface/        # HTTP controllers, routes, middleware, DTOs
├── frontend/                 # React + Vite app
│   └── src/
│       ├── api/              # Typed fetch wrappers (cardApi, catalogApi)
│       ├── components/       # CardTable, Catalog grid, modals, toolbar
│       ├── hooks/            # useCards, useCatalog, useDebounce
│       └── types/            # Shared TypeScript types
├── docker-compose.yml        # Production
└── docker-compose.dev.yml    # Development (hot reload)
```

---

## API Endpoints

### Collection

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/cards` | List collection (`?name=&set=&type=&rarity=&colors=`) |
| `POST` | `/api/cards` | Add a card |
| `DELETE` | `/api/cards` | Remove cards — body: `{ ids: string[] }` |
| `PATCH` | `/api/cards/bulk-edit` | Bulk update — body: `{ ids, patch }` |

### Catalog

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/catalog` | Browse all scraped cards (`?name=&set=&type=&rarity=&page=&limit=`) |
| `GET` | `/api/catalog/search` | Autocomplete — `?q=searchTerm` |
| `GET` | `/api/catalog/sets` | List all expansion sets |
| `GET` | `/api/catalog/stats` | Card count |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev stack with hot reload |
| `npm run dev:down` | Stop dev stack |
| `npm start` | Start production stack |
| `npm stop` | Stop production stack |
| `npm run logs` | Tail dev container logs |
| `npm run install:all` | Install backend + frontend dependencies locally |
