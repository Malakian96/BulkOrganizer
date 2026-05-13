import { useState, useEffect, useRef, FormEvent } from 'react';
import { Modal } from '../shared/Modal';
import { CreateCardPayload } from '../../types/card';
import { CatalogCard, searchCatalog } from '../../api/catalogApi';
import { useDebounce } from '../../hooks/useDebounce';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCardPayload) => Promise<void>;
}

export function AddCardModal({ isOpen, onClose, onSubmit }: AddCardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<CatalogCard[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const debouncedName = useDebounce(name, 300);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    void searchCatalog(debouncedName).then((results) => {
      if (!cancelled) {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setActiveSuggestion(-1);
      }
    });
    return () => { cancelled = true; };
  }, [debouncedName, isOpen]);

  const applysuggestion = (card: CatalogCard) => {
    setName(card.name);
    setDescription(card.effect);
    setCategory(card.type);
    setTags(card.colors.join(', '));
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      applysuggestion(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const reset = () => {
    setName(''); setDescription(''); setQuantity('1');
    setCategory(''); setTags(''); setError(null);
    setSuggestions([]); setShowSuggestions(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        quantity: quantity ? parseInt(quantity, 10) : undefined,
        category: category.trim() || undefined,
        tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      });
      reset();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Card">
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {/* Name with autocomplete */}
        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            required
            autoComplete="off"
            value={name}
            onChange={(e) => { setName(e.target.value); setShowSuggestions(true); }}
            onKeyDown={handleNameKeyDown}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Start typing a card name…"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              ref={suggestionsRef}
              className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              {suggestions.map((card, i) => (
                <li
                  key={card.cardId}
                  onMouseDown={() => applysuggestion(card)}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    i === activeSuggestion ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{card.name}</span>
                  {card.set && (
                    <span className="ml-2 text-xs text-gray-400">{card.set}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Optional description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Spell"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Comma-separated: Chaos, Order"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add Card'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
