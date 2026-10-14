import { afterEach, describe, expect, it, vi } from 'vitest';
import { isStorageTypeAvailable } from './isStorageTypeAvailable';

describe('isStorageTypeAvailable', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('cookie', () => {
    it('is available when document exists', () => {
      expect(isStorageTypeAvailable('cookie')).toBe(true);
    });

    it('is unavailable when document is missing (non-browser)', () => {
      vi.stubGlobal('document', undefined);
      expect(isStorageTypeAvailable('cookie')).toBe(false);
    });
  });

  describe('localStorage / sessionStorage', () => {
    it('are available when window and Storage exist', () => {
      expect(isStorageTypeAvailable('localStorage')).toBe(true);
      expect(isStorageTypeAvailable('sessionStorage')).toBe(true);
    });

    it('are unavailable when window is missing', () => {
      vi.stubGlobal('window', undefined);
      expect(isStorageTypeAvailable('localStorage')).toBe(false);
      expect(isStorageTypeAvailable('sessionStorage')).toBe(false);
    });

    it('are unavailable when Storage is missing', () => {
      vi.stubGlobal('Storage', undefined);
      expect(isStorageTypeAvailable('localStorage')).toBe(false);
      expect(isStorageTypeAvailable('sessionStorage')).toBe(false);
    });
  });
});
