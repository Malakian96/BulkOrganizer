import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CatalogFilters } from '../components/Catalog/CatalogFilters';

const noop = vi.fn();
const defaultFilter = {};

function renderFilters() {
  return render(
    <CatalogFilters
      sets={['OGN', 'SFD']}
      filter={defaultFilter}
      total={100}
      onFilterChange={noop}
    />,
  );
}

describe('CatalogFilters', () => {
  it('renders all 7 canonical card types as options', () => {
    renderFilters();
    const types = ['Champion', 'Unit', 'Spell', 'Gear', 'Rune', 'Relic', 'Battlefield'];
    for (const t of types) {
      expect(screen.getByRole('option', { name: t })).toBeDefined();
    }
  });

  it('does not include Terrain as a type option', () => {
    renderFilters();
    expect(screen.queryByRole('option', { name: 'Terrain' })).toBeNull();
  });

  it('renders all 5 canonical rarities as options', () => {
    renderFilters();
    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Overnumbered'];
    for (const r of rarities) {
      expect(screen.getByRole('option', { name: r })).toBeDefined();
    }
  });

  it('does not include Legendary as a rarity option', () => {
    renderFilters();
    expect(screen.queryByRole('option', { name: 'Legendary' })).toBeNull();
  });
});
