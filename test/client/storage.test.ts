import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../msw/server';
import { mockOperation } from '../msw/graphql';
import { productViewingHistorySnakeCase } from '../msw/fixtures/productViewingHistory';
import {
  CART_TOKEN_STORAGE_KEY,
  PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY,
  PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY as PVH_KEY,
  WISHLIST_TOKEN_STORAGE_KEY,
  createTestClient,
} from './helpers';

describe('client construction', () => {
  it('throws when no storefront token is provided', () => {
    // @ts-expect-error deliberately omitting the storefront token
    expect(() => createTestClient({ storefrontToken: undefined })).toThrow(
      /requires a storefront token/,
    );
  });
});

describe('cart token storage', () => {
  it('round-trips through a cookie', () => {
    const client = createTestClient({ cartTokenStorageType: 'cookie' });
    client.storeCartTokenInStorage('CA_cookie');
    expect(document.cookie).toContain(`${CART_TOKEN_STORAGE_KEY}=CA_cookie`);
    expect(client.getCartTokenFromStorage()).toBe('CA_cookie');
    client.removeCartTokenFromStorage();
    expect(client.getCartTokenFromStorage()).toBeNull();
  });

  it('round-trips through sessionStorage', () => {
    const client = createTestClient({ cartTokenStorageType: 'sessionStorage' });
    client.storeCartTokenInStorage('CA_session');
    expect(sessionStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe('CA_session');
    expect(client.getCartTokenFromStorage()).toBe('CA_session');
    client.removeCartTokenFromStorage();
    expect(sessionStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('is a no-op when storeCartToken is disabled', () => {
    const client = createTestClient({ storeCartToken: false });
    client.storeCartTokenInStorage('CA_x');
    expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBeNull();
    expect(client.getCartTokenFromStorage()).toBeNull();
    expect(() => client.removeCartTokenFromStorage()).not.toThrow();
  });
});

describe('wishlist token storage', () => {
  it('round-trips through a cookie', () => {
    const client = createTestClient({ wishlistTokenStorageType: 'cookie' });
    client.storeWishlistTokenInStorage('WL_cookie');
    expect(document.cookie).toContain(`${WISHLIST_TOKEN_STORAGE_KEY}=WL_cookie`);
    expect(client.getWishlistTokenFromStorage()).toBe('WL_cookie');
    client.removeWishlistTokenFromStorage();
    expect(client.getWishlistTokenFromStorage()).toBeNull();
  });

  it('round-trips through localStorage', () => {
    const client = createTestClient();
    client.storeWishlistTokenInStorage('WL_local');
    expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBe('WL_local');
    client.removeWishlistTokenFromStorage();
    expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('is a no-op when storeWishlistToken is disabled', () => {
    const client = createTestClient({ storeWishlistToken: false });
    client.storeWishlistTokenInStorage('WL_x');
    expect(client.getWishlistTokenFromStorage()).toBeNull();
    expect(() => client.removeWishlistTokenFromStorage()).not.toThrow();
  });
});

describe('product viewing history token storage', () => {
  it('round-trips through a cookie', () => {
    const client = createTestClient({ productViewingHistoryTokenStorageType: 'cookie' });
    client.storeProductViewingHistoryTokenInStorage('PVH_cookie');
    expect(document.cookie).toContain(`${PVH_KEY}=PVH_cookie`);
    expect(client.getProductViewingHistoryTokenFromStorage()).toBe('PVH_cookie');
    client.removeProductViewingHistoryTokenFromStorage();
    expect(client.getProductViewingHistoryTokenFromStorage()).toBeNull();
  });

  it('round-trips through localStorage', () => {
    const client = createTestClient();
    client.storeProductViewingHistoryTokenInStorage('PVH_local');
    expect(localStorage.getItem(PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY)).toBe('PVH_local');
    client.removeProductViewingHistoryTokenFromStorage();
    expect(localStorage.getItem(PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('is a no-op when storeProductViewingHistoryToken is disabled', () => {
    const client = createTestClient({ storeProductViewingHistoryToken: false });
    client.storeProductViewingHistoryTokenInStorage('PVH_x');
    expect(client.getProductViewingHistoryTokenFromStorage()).toBeNull();
    expect(() => client.removeProductViewingHistoryTokenFromStorage()).not.toThrow();
  });
});

describe('storage availability', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('disables token storage when the Storage API is unavailable', () => {
    vi.stubGlobal('Storage', undefined);
    // localStorage-backed tokens fall back to disabled during construction.
    const client = createTestClient();
    expect(client.getCartTokenFromStorage()).toBeNull();
  });
});

describe('session id', () => {
  it('returns a set session id', () => {
    const client = createTestClient();
    client.setSessionID('S_1');
    expect(client.getSessionID()).toBe('S_1');
  });

  it('clears the session id when set to a non-defined value', () => {
    const client = createTestClient({ autoGenerateSessionID: false });
    client.setSessionID(null);
    expect(client.getSessionID()).toBeNull();
  });

  it('does not auto-generate when autoGenerateSessionID is off', () => {
    const client = createTestClient({ autoGenerateSessionID: false });
    expect(client.getSessionID()).toBeNull();
  });
});

describe('updateProductViewingHistory', () => {
  it('rejects when there is no history token', async () => {
    const client = createTestClient();
    await expect(
      client.updateProductViewingHistory({ label: 'New' }),
    ).rejects.toThrow('No product viewing history to update');
  });

  it('updates the history when a token is stored', async () => {
    localStorage.setItem(PVH_KEY, productViewingHistorySnakeCase.token);
    server.use(
      mockOperation('UpdateProductViewingHistory', {
        updateProductViewingHistory: { productViewingHistory: productViewingHistorySnakeCase },
      }),
    );
    const client = createTestClient();
    const history = await client.updateProductViewingHistory({ label: 'Renamed' });
    expect(history?.token).toBe(productViewingHistorySnakeCase.token);
  });
});
