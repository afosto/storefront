import { afterEach, describe, expect, it, vi } from 'vitest';
import { isStorageTypeAvailable } from '../../src/utils/isStorageTypeAvailable';

describe('isStorageTypeAvailable', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports every storage type as available in a browser', () => {
    expect(isStorageTypeAvailable('cookie')).toBe(true);
    expect(isStorageTypeAvailable('localStorage')).toBe(true);
    expect(isStorageTypeAvailable('sessionStorage')).toBe(true);
  });

  it('reports cookies as unavailable without a document', () => {
    vi.stubGlobal('document', undefined);
    expect(isStorageTypeAvailable('cookie')).toBe(false);
  });

  it.each(['window', 'Storage'])('reports web storage as unavailable without %s', global => {
    vi.stubGlobal(global, undefined);
    expect(isStorageTypeAvailable('localStorage')).toBe(false);
    expect(isStorageTypeAvailable('sessionStorage')).toBe(false);
  });
});
