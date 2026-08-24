import { describe, expect, it } from 'vitest';

import { AVATAR_PALETTE, getAvatarColor } from '../colors';

describe('AVATAR_PALETTE', () => {
  it('contains 8 hex colors from the prototype family', () => {
    expect(AVATAR_PALETTE).toHaveLength(8);
    for (const color of AVATAR_PALETTE) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('getAvatarColor', () => {
  it('returns the same color for the same name across calls (deterministic)', () => {
    const a = getAvatarColor('Alice Johnson');
    const b = getAvatarColor('Alice Johnson');
    const c = getAvatarColor('Alice Johnson');
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('returns a value that is always a member of AVATAR_PALETTE', () => {
    const names = [
      'Alice Johnson',
      'Bob Smith',
      'Charlie Davis',
      'Diana Prince',
      'Ethan Hunt',
      'Fiona Gallagher',
      'George Miller',
      'Madonna',
      'Spaced Out Name',
      '123abc',
    ];
    for (const name of names) {
      const color = getAvatarColor(name);
      expect(AVATAR_PALETTE).toContain(color);
    }
  });

  it('is a pure function of the trimmed name (colors survive neighbor deletions)', () => {
    const before = getAvatarColor('Alice Johnson');
    const middle = getAvatarColor('Bob Smith');
    const after = getAvatarColor('Alice Johnson');
    expect(before).toBe(after);
    expect(AVATAR_PALETTE).toContain(middle);
  });

  it('returns a fixed default palette entry for an empty name', () => {
    expect(getAvatarColor('')).toBe(AVATAR_PALETTE[0]);
  });

  it('returns a fixed default palette entry for a whitespace-only name', () => {
    expect(getAvatarColor('   ')).toBe(AVATAR_PALETTE[0]);
  });

  it('trims surrounding whitespace before hashing', () => {
    expect(getAvatarColor('  Alice Johnson  ')).toBe(getAvatarColor('Alice Johnson'));
  });

  it('produces different colors for distinct names in a representative sample', () => {
    const colors = new Set([
      getAvatarColor('Alice Johnson'),
      getAvatarColor('Bob Smith'),
      getAvatarColor('Charlie Davis'),
      getAvatarColor('Diana Prince'),
      getAvatarColor('Ethan Hunt'),
      getAvatarColor('Fiona Gallagher'),
      getAvatarColor('George Miller'),
      getAvatarColor('Madonna'),
    ]);
    expect(colors.size).toBeGreaterThan(1);
  });
});
