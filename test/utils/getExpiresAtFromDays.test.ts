import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getExpiresAtFromDays } from '../../src/utils/getExpiresAtFromDays';

describe('getExpiresAtFromDays', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a millisecond timestamp the given number of days from now', () => {
    expect(getExpiresAtFromDays(30)).toBe(Date.now() + 30 * 24 * 60 * 60 * 1000);
  });
});
