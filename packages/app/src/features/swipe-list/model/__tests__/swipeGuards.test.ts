import { describe, expect, it } from 'vitest';

import { isDeleteCommitted } from '../swipeGuards';

describe('isDeleteCommitted', () => {
  it('does not commit at or below the threshold (strictly greater)', () => {
    expect(isDeleteCommitted(119, 120)).toBe(false);
    expect(isDeleteCommitted(120, 120)).toBe(false);
    expect(isDeleteCommitted(121, 120)).toBe(true);
  });

  it('is symmetric for negative (rightward) swipes', () => {
    expect(isDeleteCommitted(-119, 120)).toBe(false);
    expect(isDeleteCommitted(-120, 120)).toBe(false);
    expect(isDeleteCommitted(-121, 120)).toBe(true);
  });

  it('does not commit for zero or tiny drags', () => {
    expect(isDeleteCommitted(0, 120)).toBe(false);
    expect(isDeleteCommitted(1, 120)).toBe(false);
  });
});
