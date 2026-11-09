import { describe, expect, it } from 'vitest';
import { isDefined } from '../../src/utils/isDefined';

describe('isDefined', () => {
  it.each([
    ['null', null, false],
    ['undefined', undefined, false],
    // Not just a null check: empty strings and NaN also count as not defined.
    ['an empty string', '', false],
    ['NaN', Number.NaN, false],
    // false and 0 are deliberately treated as defined values.
    ['false', false, true],
    ['0', 0, true],
    ['a string', 'value', true],
  ])('%s → %s', (_label, value, expected) => {
    expect(isDefined(value)).toBe(expected);
  });
});
