import { createStorefrontClient } from '../../src';
import type { StorefrontClientOptions } from '../../src';

export const STOREFRONT_TOKEN = 'test-storefront-token';

/** Default storage keys: `${prefix}${storageName}`. */
export const CART_TOKEN_STORAGE_KEY = 'af-cart-token';
export const WISHLIST_TOKEN_STORAGE_KEY = 'af-wishlist-token';
export const PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY = 'af-product-viewing-history-token';
/** The user token always lives in a cookie: `${prefix}${cookieName}`. */
export const USER_TOKEN_COOKIE_KEY = 'af-sid';

/**
 * Build a storefront client with a valid storefront token and any overrides.
 * Keeps the per-test boilerplate small so each test only states what it cares
 * about (e.g. a different `cartTokenStorageType` or `autoCreateCart: false`).
 */
export const createTestClient = (options: Partial<StorefrontClientOptions> = {}) =>
  createStorefrontClient({
    storefrontToken: STOREFRONT_TOKEN,
    ...options,
  } as StorefrontClientOptions);
