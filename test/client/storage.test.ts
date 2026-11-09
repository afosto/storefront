import { afterEach, describe, expect, it, vi } from 'vitest';
import Cookies from 'js-cookie';
import { server } from '../msw/server';
import { type CapturedRequest, mockOperation } from '../msw/graphql';
import { cartSnakeCase } from '../msw/fixtures/cart';
import { validUserToken } from '../msw/fixtures/auth';
import type { StorefrontClientOptions } from '../../src';
import {
  CART_TOKEN_STORAGE_KEY,
  PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY,
  USER_TOKEN_COOKIE_KEY,
  WISHLIST_TOKEN_STORAGE_KEY,
  createTestClient,
} from './helpers';

type Client = ReturnType<typeof createTestClient>;
type StorageType = 'cookie' | 'localStorage' | 'sessionStorage';

/**
 * The cart, wishlist and product viewing history each have their own (copy-
 * pasted) storage implementation in the client, so each is tested separately.
 */
const tokenKinds = [
  {
    kind: 'cart',
    key: CART_TOKEN_STORAGE_KEY,
    typeOption: 'cartTokenStorageType',
    enabledOption: 'storeCartToken',
    store: (c: Client, token: string) => c.storeCartTokenInStorage(token),
    get: (c: Client) => c.getCartTokenFromStorage(),
    remove: (c: Client) => c.removeCartTokenFromStorage(),
  },
  {
    kind: 'wishlist',
    key: WISHLIST_TOKEN_STORAGE_KEY,
    typeOption: 'wishlistTokenStorageType',
    enabledOption: 'storeWishlistToken',
    store: (c: Client, token: string) => c.storeWishlistTokenInStorage(token),
    get: (c: Client) => c.getWishlistTokenFromStorage(),
    remove: (c: Client) => c.removeWishlistTokenFromStorage(),
  },
  {
    kind: 'product viewing history',
    key: PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY,
    typeOption: 'productViewingHistoryTokenStorageType',
    enabledOption: 'storeProductViewingHistoryToken',
    store: (c: Client, token: string) => c.storeProductViewingHistoryTokenInStorage(token),
    get: (c: Client) => c.getProductViewingHistoryTokenFromStorage(),
    remove: (c: Client) => c.removeProductViewingHistoryTokenFromStorage(),
  },
] as const;

const readNative = (type: StorageType, key: string): string | null => {
  if (type === 'cookie') {
    return Cookies.get(key) ?? null;
  }

  return (type === 'sessionStorage' ? sessionStorage : localStorage).getItem(key);
};

const storageTypes: StorageType[] = ['cookie', 'localStorage', 'sessionStorage'];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('client construction', () => {
  it('throws when no storefront token is provided', () => {
    expect(() => createTestClient({ storefrontToken: undefined })).toThrow(
      /requires a storefront token/,
    );
  });

  it.each(tokenKinds.map(t => [t.kind, t.typeOption] as const))(
    'throws for an invalid %s token storage type',
    (_kind, typeOption) => {
      expect(() =>
        createTestClient({ [typeOption]: 'indexedDB' } as Partial<StorefrontClientOptions>),
      ).toThrow(/Invalid storage type/);
    },
  );
});

describe.each(tokenKinds)('$kind token storage', ({ key, typeOption, enabledOption, ...api }) => {
  it.each(storageTypes)('stores, reads and removes the token in %s', type => {
    const client = createTestClient({ [typeOption]: type } as Partial<StorefrontClientOptions>);

    api.store(client, 'TOKEN_1');
    expect(readNative(type, key)).toBe('TOKEN_1');
    expect(api.get(client)).toBe('TOKEN_1');

    api.remove(client);
    expect(readNative(type, key)).toBeNull();
    expect(api.get(client)).toBeNull();
  });

  it('picks up a token stored before the client was created', () => {
    localStorage.setItem(key, 'TOKEN_EXISTING');

    expect(api.get(createTestClient())).toBe('TOKEN_EXISTING');
  });

  it('does nothing when storing is disabled', () => {
    localStorage.setItem(key, 'TOKEN_EXISTING');
    const client = createTestClient({ [enabledOption]: false } as Partial<StorefrontClientOptions>);

    api.store(client, 'TOKEN_NEW');
    expect(api.get(client)).toBeNull();
    api.remove(client);
    expect(localStorage.getItem(key)).toBe('TOKEN_EXISTING');
  });

  it('disables web storage when the Storage API is unavailable', () => {
    localStorage.setItem(key, 'TOKEN_EXISTING');
    vi.stubGlobal('Storage', undefined);
    const client = createTestClient();

    expect(api.get(client)).toBeNull();
    api.store(client, 'TOKEN_NEW');
    expect(localStorage.getItem(key)).toBe('TOKEN_EXISTING');
  });
});

describe('cookie options', () => {
  it('stores token cookies on path / with the secure flag', () => {
    const set = vi.spyOn(Cookies, 'set');

    createTestClient({ cartTokenStorageType: 'cookie' }).storeCartTokenInStorage('CA_1');

    expect(set).toHaveBeenCalledWith(CART_TOKEN_STORAGE_KEY, 'CA_1', { path: '/', secure: true });
  });

  it('adds the configured domain and merges per-token cookie options', () => {
    const set = vi.spyOn(Cookies, 'set');
    const client = createTestClient({
      domain: 'example.com',
      wishlistTokenStorageType: 'cookie',
      wishlistTokenCookieOptions: { expires: 30, sameSite: 'Lax' },
    });

    client.storeWishlistTokenInStorage('WL_1');

    expect(set).toHaveBeenCalledWith(WISHLIST_TOKEN_STORAGE_KEY, 'WL_1', {
      path: '/',
      secure: true,
      domain: 'example.com',
      expires: 30,
      sameSite: 'Lax',
    });
  });

  it('stores the user token cookie for one day by default, overridable per option', async () => {
    const token = validUserToken();
    server.use(mockOperation('SignInMutation', { logInCustomer: { token } }));
    const set = vi.spyOn(Cookies, 'set');

    await createTestClient().signIn({ email: 'a', password: 'b' });
    await createTestClient({ userTokenCookieOptions: { expires: 7 } }).signIn({
      email: 'a',
      password: 'b',
    });

    expect(set).toHaveBeenNthCalledWith(1, USER_TOKEN_COOKIE_KEY, token, {
      expires: 1,
      path: '/',
      secure: true,
    });
    expect(set).toHaveBeenNthCalledWith(2, USER_TOKEN_COOKIE_KEY, token, {
      expires: 7,
      path: '/',
      secure: true,
    });
  });
});

describe('session id', () => {
  it('auto-generates one session id, keeps it stable and sends it when creating a cart', async () => {
    let captured: CapturedRequest | undefined;
    server.use(
      mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, info => {
        captured = info;
      }),
    );
    const client = createTestClient();

    const sessionID = client.getSessionID();
    expect(sessionID).toMatch(/^[0-9a-f-]{36}$/);
    expect(client.getSessionID()).toBe(sessionID);

    await client.createCart();
    expect(captured?.variables.cart_input).toMatchObject({ session_id: sessionID });
  });

  it('uses a session id that was set explicitly, and clears it with a non-defined value', () => {
    const client = createTestClient({ autoGenerateSessionID: false });

    client.setSessionID('S_1');
    expect(client.getSessionID()).toBe('S_1');

    client.setSessionID(null);
    expect(client.getSessionID()).toBeNull();
  });

  it('sends no session id when auto-generation is off', async () => {
    let captured: CapturedRequest | undefined;
    server.use(
      mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, info => {
        captured = info;
      }),
    );
    const client = createTestClient({ autoGenerateSessionID: false });

    expect(client.getSessionID()).toBeNull();
    await client.createCart();
    expect(captured?.variables.cart_input).not.toHaveProperty('session_id');
  });
});
