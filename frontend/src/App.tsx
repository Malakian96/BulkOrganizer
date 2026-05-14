import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCards } from './hooks/useCards';
import { useLocalPrefs } from './hooks/useLocalPrefs';
import { DesignCard, mapCardDTO } from './mockData';
import { petalBurst } from './utils/petals';
import { Icon } from './components/shared/Icon';
import { CardDrawer } from './components/CardDrawer';
import { QuickAddModal } from './components/QuickAddModal';
import { CollectionScreen } from './components/screens/CollectionScreen';
import { CatalogScreen } from './components/screens/CatalogScreen';
import { ScannerScreen } from './components/screens/ScannerScreen';
import { DecksScreen } from './components/screens/DecksScreen';
import { WishlistScreen } from './components/screens/WishlistScreen';
import { StatsScreen } from './components/screens/StatsScreen';
import { CreateCardPayload } from './types/card';

type Tab = 'collection' | 'catalog' | 'scanner' | 'decks' | 'wishlist' | 'stats';

const NAV_SECTIONS = [
  {
    label: 'Library',
    items: [
      { id: 'collection' as Tab, icon: 'grid' as const,   label: 'Collection' },
      { id: 'catalog'    as Tab, icon: 'layers' as const, label: 'Catalog' },
      { id: 'scanner'    as Tab, icon: 'camera' as const, label: 'Scanner' },
    ],
  },
  {
    label: 'Workshop',
    items: [
      { id: 'decks'    as Tab, icon: 'decks'  as const, label: 'Decks' },
      { id: 'wishlist' as Tab, icon: 'star'   as const, label: 'Wishlist' },
      { id: 'stats'    as Tab, icon: 'chart'  as const, label: 'Ledger' },
    ],
  },
];

const MOCK_BINDERS = ['Core Set', 'Promo Vault', 'Trade Pile'];

export default function App() {
  const [tab, setTab]               = useState<Tab>('collection');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme]           = useState<'paper' | 'night'>('paper');
  const [view, setView]             = useState<'grid' | 'list'>('grid');
  const [search, setSearch]         = useState('');
  const [drawer, setDrawer]         = useState<DesignCard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected]     = useState<string[]>([]);
  const [showAdd, setShowAdd]       = useState(false);

  const { cards: rawCards, addCard, editCards, deleteCards, refresh } = useCards();
  const { wishlist, favorites, toggleWishlist, toggleFavorite, setWishlistOn } = useLocalPrefs();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Map raw CardDTOs to DesignCards
  const designCards = useMemo(
    () => rawCards.map(c => mapCardDTO(c, wishlist, favorites)),
    [rawCards, wishlist, favorites],
  );

  // Build collection map for catalog "owned" state
  const collectionMap = useMemo<Map<string, number>>(() => {
    const m = new Map<string, number>();
    rawCards.forEach(c => m.set(c.cardId, c.quantity));
    return m;
  }, [rawCards]);

  // ── Navigation ──────────────────────────────────────────────────────────
  const navigate = useCallback((t: Tab) => {
    setTab(t);
    setSidebarOpen(false);
    setSelected([]);
    setSearch('');
  }, []);

  // ── Drawer ──────────────────────────────────────────────────────────────
  const openDrawer = useCallback((card: DesignCard) => {
    setDrawer(card);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  // ── Fav / Wishlist ──────────────────────────────────────────────────────
  const handleToggleFav = useCallback((card: DesignCard, el: Element) => {
    toggleFavorite(card.cardId);
    if (!favorites.has(card.cardId)) petalBurst(el, 6);
  }, [toggleFavorite, favorites]);

  // ── Drawer update (owned qty stepper) ───────────────────────────────────
  const handleUpdate = useCallback(async (card: DesignCard, qty: number) => {
    if (card.sourceType === 'collection') {
      if (qty <= 0) {
        await deleteCards([card.id]);
      } else {
        await editCards([card.id], { quantity: qty });
      }
    } else {
      // catalog → add to collection
      await addCard({
        cardId: card.cardId,
        name: card.name,
        colors: [card.domain],
        rarity: card.rarity,
        type: card.type,
        cost: card.cost ?? undefined,
        quantity: qty,
        set: card.set,
        imageUrl: card.imageUrl,
        effect: card.effect,
        flavorText: card.flavorText,
        tags: card.tags,
      });
    }
  }, [deleteCards, editCards, addCard]);

  // ── Mark owned (from catalog CTA) ───────────────────────────────────────
  const handleMarkOwned = useCallback(async (card: DesignCard) => {
    await addCard({
      cardId: card.cardId,
      name: card.name,
      colors: [card.domain],
      rarity: card.rarity,
      type: card.type,
      cost: card.cost ?? undefined,
      quantity: 1,
      set: card.set,
      imageUrl: card.imageUrl,
      effect: card.effect,
      flavorText: card.flavorText,
      tags: card.tags,
    });
    setWishlistOn(card.cardId);
  }, [addCard, setWishlistOn]);

  // ── Scanner increment ────────────────────────────────────────────────────
  const handleIncrement = useCallback(async (card: DesignCard) => {
    if (card.sourceType === 'collection') {
      await editCards([card.id], { quantity: card.owned + 1 });
    } else {
      await addCard({
        cardId: card.cardId,
        name: card.name,
        colors: [card.domain],
        rarity: card.rarity,
        type: card.type,
        cost: card.cost ?? undefined,
        quantity: 1,
        set: card.set,
        imageUrl: card.imageUrl,
      });
    }
  }, [editCards, addCard]);

  // ── Quick Add ────────────────────────────────────────────────────────────
  const handleAddCard = useCallback(async (payload: CreateCardPayload) => {
    await addCard(payload);
    setShowAdd(false);
  }, [addCard]);

  // ── Bulk actions ─────────────────────────────────────────────────────────
  const selectedCards = useMemo(
    () => designCards.filter(c => selected.includes(c.id)),
    [designCards, selected],
  );

  const bulkFavorite = useCallback(() => {
    const allFav = selectedCards.every(c => favorites.has(c.cardId));
    selectedCards.forEach(c => {
      if (allFav) { if (favorites.has(c.cardId)) toggleFavorite(c.cardId); }
      else        { if (!favorites.has(c.cardId)) toggleFavorite(c.cardId); }
    });
  }, [selectedCards, favorites, toggleFavorite]);

  const bulkWishlist = useCallback(() => {
    const allWish = selectedCards.every(c => wishlist.has(c.cardId));
    selectedCards.forEach(c => {
      if (allWish) { if (wishlist.has(c.cardId)) toggleWishlist(c.cardId); }
      else         { if (!wishlist.has(c.cardId)) toggleWishlist(c.cardId); }
    });
  }, [selectedCards, wishlist, toggleWishlist]);

  const bulkRemoveOne = useCallback(async () => {
    for (const c of selectedCards) {
      if (c.owned <= 1) await deleteCards([c.id]);
      else await editCards([c.id], { quantity: c.owned - 1 });
    }
    setSelected([]);
  }, [selectedCards, deleteCards, editCards]);

  const bulkDelete = useCallback(async () => {
    await deleteCards(selectedCards.map(c => c.id));
    setSelected([]);
  }, [selectedCards, deleteCards]);

  // ── Topbar title ─────────────────────────────────────────────────────────
  const tabLabel: Record<Tab, string> = {
    collection: 'Collection',
    catalog: 'Catalog',
    scanner: 'Scanner',
    decks: 'Decks',
    wishlist: 'Wishlist',
    stats: 'The Ledger',
  };

  const showSearch = tab === 'collection' || tab === 'catalog';
  const showViewToggle = tab === 'collection';

  return (
    <div className="app">
      {/* ── Sidebar scrim (mobile) ─────────────────────────────────────────── */}
      <div
        className={`sb-scrim${sidebarOpen ? ' on' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="brand">
          <div className="enso" aria-hidden="true">○</div>
          <div>
            <div className="brand-name">Rift Atelier</div>
            <div className="brand-sub">collection manager</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="nav-section">
              <div className="nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item${tab === item.id ? ' active' : ''}`}
                  onClick={() => navigate(item.id)}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                  {item.id === 'collection' && rawCards.length > 0 && (
                    <span className="nav-badge">{rawCards.length}</span>
                  )}
                </button>
              ))}
            </div>
          ))}

          {/* Storage binders */}
          <div className="nav-section">
            <div className="nav-section-label">Storage</div>
            {MOCK_BINDERS.map(name => (
              <button key={name} className="nav-item">
                <Icon name="folder" size={16} />
                <span>{name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="sidebar-foot">
          <div className="avatar">A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Collector</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-500)', letterSpacing: '.1em' }}>
              {rawCards.length} cards owned
            </div>
          </div>
          <button className="btn ghost sq sm" onClick={() => void refresh()} title="Sync">
            <Icon name="download" size={14} />
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <button className="btn ghost sq hamburger" onClick={() => setSidebarOpen(v => !v)}>
            <Icon name="menu" size={18} />
          </button>

          <div className="crumb">{tabLabel[tab]}</div>

          {showSearch && (
            <div className="search">
              <span className="icn"><Icon name="search" size={14} /></span>
              <input
                placeholder={tab === 'collection' ? 'Search collection…' : 'Search catalog…'}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}

          <div className="topbar-actions">
            {showViewToggle && (
              <>
                <button
                  className={`btn ghost sq${view === 'grid' ? ' active' : ''}`}
                  title="Grid view"
                  onClick={() => setView('grid')}
                >
                  <Icon name="grid" size={15} />
                </button>
                <button
                  className={`btn ghost sq${view === 'list' ? ' active' : ''}`}
                  title="List view"
                  onClick={() => setView('list')}
                >
                  <Icon name="list" size={15} />
                </button>
              </>
            )}

            <button
              className="btn ghost sq"
              title="Toggle theme"
              onClick={() => setTheme(t => t === 'paper' ? 'night' : 'paper')}
            >
              <Icon name={theme === 'paper' ? 'moon' : 'sun'} size={15} />
            </button>

            <button className="btn primary sm" onClick={() => setShowAdd(true)}>
              <Icon name="plus" size={13} />
              <span>Add card</span>
            </button>
          </div>
        </header>

        {/* Screen */}
        <div className="content"><div className="content-inner">
          {tab === 'collection' && (
            <CollectionScreen
              cards={designCards}
              view={view}
              search={search}
              selected={selected}
              setSelected={setSelected}
              onCardClick={openDrawer}
              onToggleFav={handleToggleFav}
            />
          )}
          {tab === 'catalog' && (
            <CatalogScreen
              collectionMap={collectionMap}
              wishlist={wishlist}
              favorites={favorites}
              search={search}
              onCardClick={openDrawer}
              onToggleFav={handleToggleFav}
              onMarkOwned={handleMarkOwned}
            />
          )}
          {tab === 'scanner' && (
            <ScannerScreen
              cards={designCards}
              onIncrement={card => void handleIncrement(card)}

            />
          )}
          {tab === 'decks' && <DecksScreen />}
          {tab === 'wishlist' && (
            <WishlistScreen
              cards={designCards}
              onCardClick={openDrawer}
              onToggleFav={handleToggleFav}
            />
          )}
          {tab === 'stats' && <StatsScreen cards={designCards} />}
        </div></div>
      </div>

      {/* ── Card Drawer ─────────────────────────────────────────────────────── */}
      <CardDrawer
        card={drawerOpen ? drawer : null}
        onClose={closeDrawer}
        onUpdate={(card, patch) => {
          if (patch.owned !== undefined) void handleUpdate(card, patch.owned);
          if (patch.fav !== undefined) toggleFavorite(card.cardId);
          if (patch.wishlist !== undefined) toggleWishlist(card.cardId);
        }}
      />

      {/* ── Quick Add Modal ──────────────────────────────────────────────────── */}
      <QuickAddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAddCard}
      />

      {/* ── Bulk action bar ───────────────────────────────────────────────────── */}
      {selected.length > 0 && (
        <div className="bulkbar">
          <span className="bulkbar-count">{selected.length} selected</span>

          <button className="btn ghost sm" onClick={bulkFavorite}>
            <Icon name="heart" size={14} />
            <span>Fav</span>
          </button>

          <button className="btn ghost sm" onClick={bulkWishlist}>
            <Icon name="star" size={14} />
            <span>Wishlist</span>
          </button>

          <button className="btn ghost sm" onClick={() => void bulkRemoveOne()}>
            <Icon name="minus" size={14} />
            <span>Remove ×1</span>
          </button>

          <button className="btn danger sm" onClick={() => void bulkDelete()}>
            <Icon name="trash" size={14} />
            <span>Delete</span>
          </button>

          <div className="bulkbar-sep" />

          <button className="btn ghost sq sm" onClick={() => setSelected([])}>
            <Icon name="x" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
