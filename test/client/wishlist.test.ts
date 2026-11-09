import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../msw/server';
import {
  type CapturedRequest,
  mockOperation,
  mockOperationError,
  mockOperationSequence,
} from '../msw/graphql';
import {
  recreatedWishlistSnakeCase,
  wishlistNotFoundError,
  wishlistSnakeCase,
} from '../msw/fixtures/wishlist';
import { WISHLIST_TOKEN_STORAGE_KEY, createTestClient } from './helpers';

type Client = ReturnType<typeof createTestClient>;

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-01-01T00:00:00.000Z').getTime();

/**
 * Wishlist domain: the autoCreate flow, input validation and what is sent.
 * Shared stale-token recovery lives in recovery.test.ts.
 */
describe('wishlist', () => {
  const TOKEN = wishlistSnakeCase.token;
  const seedStoredToken = (token = TOKEN) =>
    localStorage.setItem(WISHLIST_TOKEN_STORAGE_KEY, token);

  const record = () => {
    const requests: CapturedRequest[] = [];
    return { requests, push: (info: CapturedRequest) => requests.push(info) };
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createWishlist', () => {
    it('sends the default label and expiry, stores the token and returns the camelCase wishlist', async () => {
      vi.useFakeTimers({ toFake: ['Date'], now: NOW });
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('CreateWishlist', { createWishlist: { wishlist: wishlistSnakeCase } }, i => {
          variables = i.variables;
        }),
      );

      const wishlist = await createTestClient().createWishlist();

      expect(variables?.wishlist_input).toEqual({ label: 'Wishlist', expires_at: NOW + 30 * DAY });
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBe(TOKEN);
      expect(wishlist?.token).toBe(TOKEN);
      expect(wishlist?.items[0].product.prices[0].originalAmount).toBe(3000);
    });
  });

  describe('getWishlist', () => {
    it('returns null without a request when there is no wishlist token', async () => {
      await expect(createTestClient().getWishlist()).resolves.toBeNull();
    });

    it('fetches the wishlist for the stored token', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('GetWishlist', { wishlist: wishlistSnakeCase }, i => {
          variables = i.variables;
        }),
      );

      const wishlist = await createTestClient().getWishlist();

      expect(variables).toEqual({ token: TOKEN });
      expect(wishlist?.token).toBe(TOKEN);
    });
  });

  describe('addWishlistItem', () => {
    const item = { sku: 'SKU-1', quantity: 1, expiresAt: 1702592000 };

    it('auto-creates a wishlist when there is no token, then adds the item to it', async () => {
      const { requests, push } = record();
      server.use(
        mockOperation('CreateWishlist', { createWishlist: { wishlist: wishlistSnakeCase } }, push),
        mockOperation(
          'AddItemToWishlist',
          { addItemToWishlist: { wishlist: wishlistSnakeCase } },
          push,
        ),
      );

      const wishlist = await createTestClient().addWishlistItem(item);

      expect(requests.map(r => r.operationName)).toEqual(['CreateWishlist', 'AddItemToWishlist']);
      expect(requests[1].variables.wishlist_input).toEqual({
        sku: 'SKU-1',
        quantity: 1,
        expires_at: 1702592000,
        token: TOKEN,
      });
      expect(wishlist?.token).toBe(TOKEN);
    });

    it('defaults the item expiry to the configured number of days', async () => {
      vi.useFakeTimers({ toFake: ['Date'], now: NOW });
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'AddItemToWishlist',
          { addItemToWishlist: { wishlist: wishlistSnakeCase } },
          i => {
            variables = i.variables;
          },
        ),
      );

      await createTestClient({ wishlistDefaultExpiresInDays: 7 }).addWishlistItem({
        sku: 'SKU-1',
        quantity: 1,
      } as typeof item);

      expect(variables?.wishlist_input).toMatchObject({ expires_at: NOW + 7 * DAY });
    });

    it('on a 404 drops the stale token, recreates the wishlist, stores it and retries', async () => {
      seedStoredToken('WL_stale');
      const { requests, push } = record();
      server.use(
        mockOperation(
          'CreateWishlist',
          { createWishlist: { wishlist: recreatedWishlistSnakeCase } },
          push,
        ),
        mockOperationSequence(
          'AddItemToWishlist',
          [
            { errors: [wishlistNotFoundError] },
            { data: { addItemToWishlist: { wishlist: recreatedWishlistSnakeCase } } },
          ],
          push,
        ),
      );

      const wishlist = await createTestClient().addWishlistItem(item);

      expect(requests.map(r => r.operationName)).toEqual([
        'AddItemToWishlist',
        'CreateWishlist',
        'AddItemToWishlist',
      ]);
      expect(requests[2].variables.wishlist_input).toMatchObject({
        token: recreatedWishlistSnakeCase.token,
      });
      expect(wishlist?.token).toBe(recreatedWishlistSnakeCase.token);
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBe(
        recreatedWishlistSnakeCase.token,
      );
    });

    it('passes a non-404 error through and keeps the stored token', async () => {
      seedStoredToken();
      server.use(
        mockOperationError('AddItemToWishlist', [
          { message: 'Error', extensions: { status: 500 } },
        ]),
      );

      await expect(createTestClient().addWishlistItem(item)).rejects.toBeDefined();
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBe(TOKEN);
    });

    it('with autoCreateWishlist off, neither creates a wishlist nor recovers from a 404', async () => {
      seedStoredToken();
      const { requests, push } = record();
      server.use(
        mockOperation('CreateWishlist', { createWishlist: { wishlist: wishlistSnakeCase } }, push),
        mockOperationError('AddItemToWishlist', [wishlistNotFoundError]),
      );

      await expect(
        createTestClient({ autoCreateWishlist: false }).addWishlistItem(item),
      ).rejects.toBeDefined();
      expect(requests).toEqual([]);
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBe(TOKEN);
    });
  });

  describe('removeWishlistItem', () => {
    it('rejects when there is no wishlist token', async () => {
      await expect(createTestClient().removeWishlistItem('SKU-1')).rejects.toThrow(
        'No wishlist token provided',
      );
    });

    it.each([
      ['an undefined item', undefined],
      ['an empty sku', ''],
      ['an empty object', {}],
    ])('rejects %s', async (_label, item) => {
      seedStoredToken();
      await expect(
        createTestClient().removeWishlistItem(item as Parameters<Client['removeWishlistItem']>[0]),
      ).rejects.toThrow('Provide an id or a sku to remove');
    });

    it.each([
      ['a sku string', 'SKU-1', { sku: 'SKU-1' }],
      ['{ sku }', { sku: 'SKU-1' }, { sku: 'SKU-1' }],
      ['{ id }', { id: 'WLI_1' }, { id: 'WLI_1' }],
    ] as const)('identifies the item by %s', async (_label, item, expected) => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'RemoveItemFromWishlist',
          { removeItemFromWishlist: { wishlist: wishlistSnakeCase } },
          i => {
            variables = i.variables;
          },
        ),
      );

      const wishlist = await createTestClient().removeWishlistItem(item);

      expect(variables?.wishlist_input).toEqual({ ...expected, token: TOKEN });
      expect(wishlist?.token).toBe(TOKEN);
    });
  });

  describe('updateWishlist & deleteWishlist', () => {
    it('rejects updating when there is no wishlist token', async () => {
      await expect(
        createTestClient().updateWishlist({ label: 'New', expiresAt: 1702592000 }),
      ).rejects.toThrow('No wishlist to update');
    });

    it('updates the stored wishlist', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('UpdateWishlist', { updateWishlist: { wishlist: wishlistSnakeCase } }, i => {
          variables = i.variables;
        }),
      );

      await createTestClient().updateWishlist({ label: 'Renamed', expiresAt: 1702592000 });

      expect(variables?.wishlist_input).toEqual({
        token: TOKEN,
        label: 'Renamed',
        expires_at: 1702592000,
      });
    });

    it('rejects deleting when there is no wishlist token', async () => {
      await expect(createTestClient().deleteWishlist()).rejects.toThrow(
        'No wishlist token provided',
      );
    });

    it('deletes the stored wishlist and reports success', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('DeleteWishlist', { deleteWishlist: { success: true } }, i => {
          variables = i.variables;
        }),
      );

      await expect(createTestClient().deleteWishlist()).resolves.toBe(true);
      expect(variables?.wishlist_input).toEqual({ token: TOKEN });
    });
  });
});
