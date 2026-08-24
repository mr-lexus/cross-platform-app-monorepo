import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { createMockItems } from '../mockData';

const VALID_AVATAR_PREFIX = 'https://i.pravatar.cc/';
const BROKEN_AVATAR_HOST = 'invalid-avatars.example.com';

describe('createMockItems', () => {
  const items = createMockItems(1000);

  it('creates exactly the requested number of items', () => {
    expect(items).toHaveLength(1000);
  });

  it('assigns unique string ids', () => {
    const ids = items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(typeof id).toBe('string');
    }
  });

  it('is deterministic — two calls deep-equal', () => {
    expect(createMockItems(1000)).toEqual(createMockItems(1000));
  });

  it('covers all three avatar states with at least 10% each', () => {
    let valid = 0;
    let missing = 0;
    let broken = 0;
    for (const item of items) {
      if (item.avatarUrl === undefined) {
        missing += 1;
      } else if (item.avatarUrl.startsWith(VALID_AVATAR_PREFIX)) {
        valid += 1;
      } else if (item.avatarUrl.includes(BROKEN_AVATAR_HOST)) {
        broken += 1;
      }
    }
    expect(valid).toBeGreaterThanOrEqual(100);
    expect(missing).toBeGreaterThanOrEqual(100);
    expect(broken).toBeGreaterThanOrEqual(100);
  });

  it('never uses Math.random (data generation is pure)', () => {
    const source = readFileSync(
      'packages/app/src/features/swipe-list/model/mockData.ts',
      'utf8',
    );
    expect(source.includes('Math.random')).toBe(false);
  });
});
