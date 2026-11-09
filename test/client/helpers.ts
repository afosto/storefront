import Cookies from 'js-cookie';
import { createStorefrontClient } from '../../src';
import type { StorefrontClientOptions } from '../../src';
import { validUserToken } from '../msw/fixtures/auth';

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

/**
 * A client that starts signed in: a valid user token is seeded in the `af-sid`
 * cookie before creation, so `authenticatedRequest`-backed methods send the
 * user token. Returns the token so tests can assert the Authorization header.
 */
export const createSignedInClient = (options: Partial<StorefrontClientOptions> = {}) => {
  const userToken = validUserToken();
  Cookies.set(USER_TOKEN_COOKIE_KEY, userToken);
  return { client: createTestClient(options), userToken };
};
