import { describe, expect, it } from 'vitest';
import { isDefined } from './isDefined';

describe('isDefined', () => {
  it('treats null and undefined as not defined', () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });

  it('treats false and 0 as defined on purpose', () => {
    expect(isDefined(false)).toBe(true);
    expect(isDefined(0)).toBe(true);
  });

  it('treats truthy values as defined', () => {
    expect(isDefined('value')).toBe(true);
    expect(isDefined(42)).toBe(true);
    expect(isDefined({})).toBe(true);
    expect(isDefined([])).toBe(true);
  });

  it('treats other falsy values (empty string, NaN) as not defined', () => {
    expect(isDefined('')).toBe(false);
    expect(isDefined(NaN)).toBe(false);
  });
});
