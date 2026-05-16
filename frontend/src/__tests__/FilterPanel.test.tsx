import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../components/FilterPanel';

const noop = vi.fn();

function renderPanel() {
  return render(
    <FilterPanel
      selectedDomains={[]}
      onToggleDomain={noop}
      selectedRarities={[]}
      onToggleRarity={noop}
      selectedTypes={[]}
      onToggleType={noop}
      costRange={[0, 12]}
      onCostRangeChange={noop}
    />,
  );
}

describe('FilterPanel — types', () => {
  it('renders all 7 canonical card types after opening accordion', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Type'));
    const types = ['Champion', 'Unit', 'Spell', 'Gear', 'Rune', 'Relic', 'Battlefield'];
    for (const t of types) {
      expect(screen.getByText(t)).toBeDefined();
    }
  });

  it('does not include Terrain or Legendary after opening accordion', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Type'));
    expect(screen.queryByText('Terrain')).toBeNull();
    expect(screen.queryByText('Legendary')).toBeNull();
  });
});

describe('FilterPanel — rarities', () => {
  it('renders all 5 canonical rarity ids after opening accordion', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Rarity'));
    for (const id of ['common', 'uncommon', 'rare', 'epic', 'overnumbered']) {
      expect(screen.getByText(id)).toBeDefined();
    }
  });

  it('does not include legendary in rarity list', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Rarity'));
    expect(screen.queryByText('legendary')).toBeNull();
  });
});
