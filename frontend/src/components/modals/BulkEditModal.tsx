import { useState, FormEvent } from 'react';
import { Modal } from '../shared/Modal';
import { BulkEditPayload } from '../../types/card';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onSubmit: (patch: BulkEditPayload['patch']) => Promise<void>;
}

export function BulkEditModal({ isOpen, onClose, selectedCount, onSubmit }: BulkEditModalProps) {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setDescription(''); setQuantity(''); setCategory(''); setTags(''); setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const patch: BulkEditPayload['patch'] = {};
    if (description.trim()) patch.description = description.trim();
    if (quantity !== '') patch.quantity = parseInt(quantity, 10);
    if (category.trim()) patch.category = category.trim();
    if (tags.trim()) patch.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (Object.keys(patch).length === 0) {
      setError('Fill in at least one field to update.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(patch);
      reset();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Bulk Edit — ${selectedCount} card${selectedCount > 1 ? 's' : ''}`}>
      <p className="mb-4 text-sm text-gray-500">
        Only filled fields will be updated. Empty fields are left unchanged.
      </p>
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Leave blank to keep existing"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Leave blank to keep"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text" value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Leave blank to keep"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
          <input
            type="text" value={tags} onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Replaces all tags: holo, foil"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {submitting ? 'Saving…' : 'Apply Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
