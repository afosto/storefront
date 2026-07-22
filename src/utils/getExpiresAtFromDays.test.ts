import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getExpiresAtFromDays } from './getExpiresAtFromDays';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

describe('getExpiresAtFromDays', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a timestamp the given number of days in the future', () => {
    const now = Date.now();

    expect(getExpiresAtFromDays(30)).toBe(now + 30 * MILLISECONDS_PER_DAY);
    expect(getExpiresAtFromDays(1)).toBe(now + MILLISECONDS_PER_DAY);
  });

  it('returns now for 0 days', () => {
    expect(getExpiresAtFromDays(0)).toBe(Date.now());
  });

  it('supports negative days (a moment in the past)', () => {
    expect(getExpiresAtFromDays(-1)).toBe(Date.now() - MILLISECONDS_PER_DAY);
  });
});
