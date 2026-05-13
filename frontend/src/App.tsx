import { useState } from 'react';
import { useCards } from './hooks/useCards';
import { CardTable } from './components/CardTable/CardTable';
import { Toolbar } from './components/Toolbar';
import { AddCardModal } from './components/modals/AddCardModal';
import { BulkEditModal } from './components/modals/BulkEditModal';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { CatalogView } from './components/Catalog/CatalogView';

type Tab = 'collection' | 'catalog';

export default function App() {
  const [tab, setTab] = useState<Tab>('collection');

  const {
    cards, loading, error,
    selectedIds, isAllSelected,
    toggleSelect, toggleSelectAll,
    addCard, removeSelected, bulkEdit,
  } = useCards();

  const [showAdd, setShowAdd] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Bulk Organizer</h1>
        </div>
        {/* Tab bar */}
        <div className="mx-auto max-w-7xl border-t border-gray-200 px-4">
          <nav className="-mb-px flex gap-6">
            {(['collection', 'catalog'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-2 py-3 text-sm font-medium capitalize transition ${
                  tab === t
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'collection' ? `My Collection (${cards.length})` : 'Card Catalog'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === 'collection' && (
          <>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                Error: {error}
              </div>
            )}
            <Toolbar
              selectedCount={selectedIds.size}
              onAddClick={() => setShowAdd(true)}
              onDeleteSelected={() => { void removeSelected(); }}
              onBulkEditClick={() => setShowBulkEdit(true)}
            />
            {loading ? (
              <LoadingSpinner />
            ) : (
              <CardTable
                cards={cards}
                selectedIds={selectedIds}
                isAllSelected={isAllSelected}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
              />
            )}
          </>
        )}

        {tab === 'catalog' && <CatalogView />}
      </main>

      <AddCardModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={async (payload) => { await addCard(payload); setShowAdd(false); }}
      />
      <BulkEditModal
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        selectedCount={selectedIds.size}
        onSubmit={async (patch) => { await bulkEdit(patch); setShowBulkEdit(false); }}
      />
    </div>
  );
}
