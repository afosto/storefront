import Cookies from 'js-cookie';
import type { BrowserStorageTypes, GraphQLClientError, OptionalString } from '../types';

export interface TokenStoreOptions {
  /** Whether the token is kept in browser storage. When false, the store only reads null. */
  enabled: boolean;
  storageType: BrowserStorageTypes;
  storagePath: string;
  cookieOptions: Cookies.CookieAttributes;
  /** Whether an unknown stored token is cleared when the API answers with a 404. */
  recoverFromNotFound: boolean;
}

export type TokenStore = ReturnType<typeof createTokenStore>;

const getStorage = (storageType: BrowserStorageTypes) =>
  storageType === 'sessionStorage' ? sessionStorage : localStorage;

const isNotFoundError = (error: GraphQLClientError) =>
  (error?.response?.errors || []).some(responseError => responseError.extensions?.status === 404);

/**
 * Keeps one token (cart, wishlist or product viewing history) in memory and, when enabled, in a
 * cookie or Web Storage.
 */
export const createTokenStore = ({
  enabled,
  storageType,
  storagePath,
  cookieOptions,
  recoverFromNotFound,
}: TokenStoreOptions) => {
  let token: OptionalString = null;

  /**
   * Read the token from storage.
   */
  const readFromStorage = (): OptionalString => {
    try {
      if (!enabled) {
        return null;
      }

      if (storageType === 'cookie') {
        return Cookies.get(storagePath) || null;
      }

      return getStorage(storageType).getItem(storagePath);
    } catch {
      return null;
    }
  };

  /**
   * Remove the token from storage and memory.
   */
  const removeFromStorage = () => {
    try {
      if (!enabled) {
        return;
      }

      if (storageType === 'cookie') {
        Cookies.remove(storagePath, cookieOptions);
      } else {
        getStorage(storageType).removeItem(storagePath);
      }

      token = null;
    } catch {}
  };

  /**
   * Store the token in storage and memory.
   */
  const storeInStorage = (value: string) => {
    try {
      if (!enabled) {
        return;
      }

      if (storageType === 'cookie') {
        Cookies.set(storagePath, value, cookieOptions);
      } else {
        getStorage(storageType).setItem(storagePath, value);
      }

      token = value;
    } catch {}
  };

  /**
   * Load the token from storage into memory.
   */
  const initialize = () => {
    token = readFromStorage();
  };

  /**
   * Handle a failed request made with the stored token. When the request used the stored token
   * (no explicit token) and recovery is enabled, a 404 clears the stored token and `callback`
   * decides the outcome. Otherwise the error is rethrown.
   */
  const handleError = async <T>(
    error: unknown,
    explicitToken: OptionalString | undefined,
    callback: (notFound: boolean) => T | Promise<T>,
  ): Promise<T> => {
    if (!recoverFromNotFound || !token || explicitToken) {
      return Promise.reject(error);
    }

    const notFound = isNotFoundError(error as GraphQLClientError);

    if (notFound) {
      removeFromStorage();
    }

    return callback(notFound);
  };

  return {
    get token() {
      return token;
    },
    readFromStorage,
    removeFromStorage,
    storeInStorage,
    initialize,
    handleError,
  };
};
