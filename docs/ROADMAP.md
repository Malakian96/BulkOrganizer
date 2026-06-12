# Rift Atelier — Feature Roadmap

Based on a survey of established TCG collection managers (ManaBox, Dragon Shield,
Moxfield, Collectr, Card Codex, pkmn.gg) and the official Riftbound rules.

## Where we stand vs. the field

| Core feature (common to the major apps) | Status |
|---|---|
| Camera scanning into collection | ✅ Live scanner (Socket.IO + OCR) |
| Set completion tracking | ✅ Catalog tab with per-set owned/missing % |
| Quantity management & bulk edits | ✅ |
| Wishlist | ✅ (localStorage only — see below) |
| Foil quantity tracking | ✅ data model + drawer UI |
| Notes per card | ✅ data model + drawer UI |
| CSV export | ✅ from the Collection screen |
| CSV import | ❌ planned |
| Prices / collection value | ❌ planned |
| Deck builder | ❌ planned (Decks tab is a mock) |
| Binders / custom lists | ❌ planned (sidebar items are mocks) |
| Sharing (public collection/deck links) | ❌ later |

## Planned — in priority order

### 1. Deck builder (replaces the mock Decks tab)
The single biggest gap. Official Riftbound construction rules to enforce:
- Main deck: exactly 40+ cards, max 3 copies of a name (chosen champion copies count)
- Rune deck: exactly 12 runes
- 1 Legend; 1 chosen Champion whose champion tag matches the Legend
- 3 Battlefields
- Max 3 signature cards matching the Legend's champion tag
- Card domains restricted to the Legend's two domains

Implementation sketch: `decks` Mongo collection (name, legendCardId, championCardId,
battlefield/main/rune card lists as `{cardId, count}`), folder-per-use-case handlers
(CreateDeck, UpdateDeck, DeleteDeck, GetDecks), legality validation in the domain
layer, deck editor screen fed by the catalog with "owned vs. needed" overlay from
the collection (the data model join makes this cheap).

### 2. CSV import
Counterpart to export — bulk seeding from other tools. Accept `cardId,quantity,
foilQuantity` (header-tolerant), resolve against the catalog, reject unknown IDs
with a per-row report. Backend: `POST /api/cards/import` reusing AddCardHandler's
merge semantics.

### 3. Prices & collection value
Every major tracker has it; needs a price source for Riftbound (TCGplayer lists
Riftbound singles). Best done in the RiftboundScraper project: scrape/refresh a
`price` field onto catalog documents, then this app gets card prices and total
collection value for free via the read-time join. UI: value on Stats/Ledger,
price per card in the drawer.

### 4. Server-persisted wishlist & favorites
Currently `localStorage` (lost across browsers/devices). Move to a small
`prefs` collection or fields on the collection entry; keep the local copy as a
cache. Also unlocks "wishlist → missing cards in set" cross-links.

### 5. Binders / custom lists
Replace the hardcoded sidebar "Storage" mocks with user-defined lists
(trade binder, showcase, …) — entries reference cardIds, same join pattern.

### Later
- Public share links for collection/decks (read-only views)
- Price history charts (needs scraper to keep snapshots)
- Trade matching (your wishlist × other collection's trade binder)

## Sources
- [GrimDeck — Best MTG collection trackers compared](https://grimdeck.com/blog/best-mtg-collection-trackers)
- [GrimDeck — Tracker & deck builder comparison](https://grimdeck.com/blog/best-mtg-collection-tracker-deck-builder)
- [ManaBox (Google Play)](https://play.google.com/store/apps/details?id=skilldevs.com.manabox&hl=en)
- [Collectr](https://getcollectr.com/) · [pkmn.gg](https://www.pkmn.gg/) · [Card Codex review](https://gamespace.com/all-articles/news/card-codex-review-the-pokemon-collection-tracker-that-treats-your-binder-like-a-portfolio/)
- [Draftsim — 11 best MTG collection trackers](https://draftsim.com/mtg-collection-tracker/)
- [Riftbound official deckbuilding primer](https://riftbound.leagueoflegends.com/en-us/news/rules-and-releases/deckbuilding-primer/)
- [Riftbound deck construction (wiki)](https://riftbound.wiki.fextralife.com/Deck_Construction)
