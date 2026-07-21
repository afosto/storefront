import type { BrowserStorageTypes } from '../types';

export const isStorageTypeAvailable = (storageType: BrowserStorageTypes) => {
  if (storageType === 'cookie') {
    return typeof document !== 'undefined';
  }

  return typeof window !== 'undefined' && typeof Storage !== 'undefined';
};
