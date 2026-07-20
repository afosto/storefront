const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculate a millisecond timestamp for a date the given number of days in the
 * future, relative to now.
 */
export const getExpiresAtFromDays = (days: number): number =>
  Date.now() + days * MILLISECONDS_PER_DAY;
