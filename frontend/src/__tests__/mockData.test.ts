import { describe, it, expect } from 'vitest';
import { colorsToDomain, normalizeRarity, RARITIES, DOMAINS } from '../mockData';

describe('colorsToDomain', () => {
  it('maps Red → fury', () => expect(colorsToDomain(['Red'])).toBe('fury'));
  it('maps Blue → mind', () => expect(colorsToDomain(['Blue'])).toBe('mind'));
  it('maps Green → calm', () => expect(colorsToDomain(['Green'])).toBe('calm'));
  it('maps Orange → body', () => expect(colorsToDomain(['Orange'])).toBe('body'));
  it('maps Purple → chaos', () => expect(colorsToDomain(['Purple'])).toBe('chaos'));
  it('maps Yellow → order', () => expect(colorsToDomain(['Yellow'])).toBe('order'));

  it('accepts explicit domain ids', () => {
    for (const d of DOMAINS) {
      expect(colorsToDomain([d.id])).toBe(d.id);
    }
  });

  it('is case-insensitive', () => {
    expect(colorsToDomain(['RED'])).toBe('fury');
    expect(colorsToDomain(['blue'])).toBe('mind');
  });

  it('returns a valid domain for unknown colors', () => {
    const result = colorsToDomain(['unknownxyz']);
    expect(DOMAINS.map(d => d.id)).toContain(result);
  });

  it('returns body for empty array (first element is empty → hash fallback)', () => {
    const result = colorsToDomain([]);
    expect(DOMAINS.map(d => d.id)).toContain(result);
  });
});

describe('normalizeRarity', () => {
  it('accepts all five canonical rarities', () => {
    expect(normalizeRarity('common')).toBe('common');
    expect(normalizeRarity('uncommon')).toBe('uncommon');
    expect(normalizeRarity('rare')).toBe('rare');
    expect(normalizeRarity('epic')).toBe('epic');
    expect(normalizeRarity('overnumbered')).toBe('overnumbered');
  });

  it('rejects legendary (not a real Riftbound rarity)', () => {
    expect(normalizeRarity('legendary')).toBe('common');
  });

  it('defaults unknown values to common', () => {
    expect(normalizeRarity('mythic')).toBe('common');
    expect(normalizeRarity('')).toBe('common');
    expect(normalizeRarity('RARE')).toBe('rare');
  });

  it('RARITIES array contains exactly the five canonical rarities', () => {
    const ids = RARITIES.map(r => r.id);
    expect(ids).toEqual(['common', 'uncommon', 'rare', 'epic', 'overnumbered']);
    expect(ids).not.toContain('legendary');
  });
});
