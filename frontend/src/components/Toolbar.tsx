interface ToolbarProps {
  selectedCount: number;
  onAddClick: () => void;
  onDeleteSelected: () => void;
  onBulkEditClick: () => void;
}

export function Toolbar({ selectedCount, onAddClick, onDeleteSelected, onBulkEditClick }: ToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm text-gray-500">
        {hasSelection ? `${selectedCount} card${selectedCount > 1 ? 's' : ''} selected` : ''}
      </p>
      <div className="flex gap-2">
        {hasSelection && (
          <>
            <button
              onClick={onBulkEditClick}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800"
            >
              Bulk Edit ({selectedCount})
            </button>
            <button
              onClick={onDeleteSelected}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800"
            >
              Delete ({selectedCount})
            </button>
          </>
        )}
        <button
          onClick={onAddClick}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 active:bg-gray-800"
        >
          + Add Card
        </button>
      </div>
    </div>
  );
}
