import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { mockOperation, mockOperationError, mockOperationSequence } from '../msw/graphql';
import {
  recreatedWishlistSnakeCase,
  wishlistNotFoundError,
  wishlistSnakeCase,
} from '../msw/fixtures/wishlist';
import { WISHLIST_TOKEN_STORAGE_KEY, createTestClient } from './helpers';

/**
 * Wishlist domain — rolled out from the cart blueprint: autoCreate flow,
 * still-valid recovery on a 404, storageType validation and error handling.
 */
describe('wishlist domain', () => {
  const seedStoredToken = (token = wishlistSnakeCase.token) => {
    localStorage.setItem(WISHLIST_TOKEN_STORAGE_KEY, token);
  };

  describe('createWishlist', () => {
    it('creates a wishlist and returns the camelCase result', async () => {
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('CreateWishlist', { createWishlist: { wishlist: wishlistSnakeCase } }, info => {
          variables = info.variables;
        }),
      );

      const client = createTestClient();
      const wishlist = await client.createWishlist();

      expect(wishlist?.token).toBe(wishlistSnakeCase.token);
      expect(wishlist?.createdAt).toBe(wishlistSnakeCase.created_at);
      expect(wishlist?.items[0].product.prices[0].originalAmount).toBe(3000);

      // Defaults are applied: label + a computed expiry, sent in snake_case.
      const input = variables?.wishlist_input as Record<string, unknown>;
      expect(input.label).toBe('Wishlist');
      expect(typeof input.expires_at).toBe('number');
    });
  });

  describe('getWishlist', () => {
    it('returns null when there is no wishlist token', async () => {
      const client = createTestClient();
      await expect(client.getWishlist()).resolves.toBeNull();
    });

    it('fetches the stored wishlist and converts it to camelCase', async () => {
      seedStoredToken();
      server.use(mockOperation('GetWishlist', { wishlist: wishlistSnakeCase }));

      const client = createTestClient();
      const wishlist = await client.getWishlist();
      expect(wishlist?.token).toBe(wishlistSnakeCase.token);
    });

    it('drops the stored token and returns null on a 404', async () => {
      seedStoredToken();
      server.use(mockOperationError('GetWishlist', [wishlistNotFoundError]));

      const client = createTestClient();
      await expect(client.getWishlist()).resolves.toBeNull();
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('propagates the error for an explicitly passed token (no recovery)', async () => {
      seedStoredToken();
      server.use(mockOperationError('GetWishlist', [wishlistNotFoundError]));

      const client = createTestClient();
      await expect(client.getWishlist('WL_explicit')).rejects.toBeDefined();
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBe(wishlistSnakeCase.token);
    });
  });

  describe('addWishlistItem — autoCreate flow', () => {
    const item = { sku: 'SKU-1', quantity: 1, expiresAt: 1702592000 };

    it('auto-creates a wishlist first when no token exists, then adds the item', async () => {
      const operations: string[] = [];
      let addVariables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('CreateWishlist', { createWishlist: { wishlist: wishlistSnakeCase } }, () =>
          operations.push('CreateWishlist'),
        ),
        mockOperation('AddItemToWishlist', { addItemToWishlist: { wishlist: wishlistSnakeCase } }, info => {
          operations.push('AddItemToWishlist');
          addVariables = info.variables;
        }),
      );

      const client = createTestClient();
      const wishlist = await client.addWishlistItem(item);

      expect(operations).toEqual(['CreateWishlist', 'AddItemToWishlist']);
      expect(wishlist?.token).toBe(wishlistSnakeCase.token);
      expect(JSON.stringify(addVariables)).not.toMatch(/auto_?create/i);
    });

    it('recovers on a 404: removes the stale token and recreates the wishlist', async () => {
      seedStoredToken('WL_stale');
      const created: string[] = [];
      server.use(
        mockOperation('CreateWishlist', { createWishlist: { wishlist: recreatedWishlistSnakeCase } }, () =>
          created.push('CreateWishlist'),
        ),
        mockOperationSequence('AddItemToWishlist', [
          { errors: [wishlistNotFoundError] },
          { data: { addItemToWishlist: { wishlist: recreatedWishlistSnakeCase } } },
        ]),
      );

      const client = createTestClient();
      const wishlist = await client.addWishlistItem(item);

      expect(created).toEqual(['CreateWishlist']);
      expect(wishlist?.token).toBe(recreatedWishlistSnakeCase.token);
      // The stale token was cleared during recovery.
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('passes a non-404 error through and keeps the stored token intact', async () => {
      seedStoredToken();
      server.use(
        mockOperationError('AddItemToWishlist', [
          { message: 'Server error', extensions: { status: 500 } },
        ]),
      );

      const client = createTestClient();
      await expect(client.addWishlistItem(item)).rejects.toBeDefined();
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBe(wishlistSnakeCase.token);
    });

    it('with autoCreateWishlist off, does not create and passes the error through', async () => {
      seedStoredToken();
      const created: string[] = [];
      server.use(
        mockOperation('CreateWishlist', { createWishlist: { wishlist: wishlistSnakeCase } }, () =>
          created.push('CreateWishlist'),
        ),
        mockOperationError('AddItemToWishlist', [wishlistNotFoundError]),
      );

      const client = createTestClient({ autoCreateWishlist: false });
      await expect(client.addWishlistItem(item)).rejects.toBeDefined();
      expect(created).toEqual([]);
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBe(wishlistSnakeCase.token);
    });
  });

  describe('removeWishlistItem', () => {
    it('rejects when there is no wishlist token', async () => {
      const client = createTestClient();
      await expect(
        client.removeWishlistItem('SKU-1', undefined as unknown as string),
      ).rejects.toThrow('No wishlist token provided');
    });

    it('rejects when no sku is provided', async () => {
      seedStoredToken();
      const client = createTestClient();
      await expect(
        client.removeWishlistItem(undefined as unknown as string, undefined as unknown as string),
      ).rejects.toThrow('Provide a sku to remove');
    });

    it('removes an item and returns the updated wishlist', async () => {
      seedStoredToken();
      server.use(
        mockOperation('RemoveItemFromWishlist', { removeItemFromWishlist: { wishlist: wishlistSnakeCase } }),
      );

      const client = createTestClient();
      const wishlist = await client.removeWishlistItem('SKU-1', wishlistSnakeCase.token);
      expect(wishlist?.token).toBe(wishlistSnakeCase.token);
    });
  });

  describe('updateWishlist & deleteWishlist', () => {
    it('rejects updating when there is no wishlist token', async () => {
      const client = createTestClient();
      await expect(
        client.updateWishlist({ label: 'New', expiresAt: 1702592000 }),
      ).rejects.toThrow('No wishlist to update');
    });

    it('updates a wishlist', async () => {
      seedStoredToken();
      server.use(mockOperation('UpdateWishlist', { updateWishlist: { wishlist: wishlistSnakeCase } }));

      const client = createTestClient();
      const wishlist = await client.updateWishlist({ label: 'Renamed', expiresAt: 1702592000 });
      expect(wishlist?.token).toBe(wishlistSnakeCase.token);
    });

    it('rejects deleting when there is no wishlist token', async () => {
      const client = createTestClient();
      await expect(client.deleteWishlist()).rejects.toThrow('No wishlist token provided');
    });

    it('deletes a wishlist and returns success', async () => {
      seedStoredToken();
      server.use(mockOperation('DeleteWishlist', { deleteWishlist: { success: true } }));

      const client = createTestClient();
      await expect(client.deleteWishlist()).resolves.toBe(true);
    });
  });

  describe('storageType validation & variants', () => {
    it('throws for an invalid wishlist token storage type', () => {
      expect(() =>
        // @ts-expect-error invalid storage type on purpose
        createTestClient({ wishlistTokenStorageType: 'indexedDB' }),
      ).toThrow(/Invalid storage type/);
    });

    it('reads the token from sessionStorage when configured', async () => {
      sessionStorage.setItem(WISHLIST_TOKEN_STORAGE_KEY, wishlistSnakeCase.token);
      server.use(mockOperation('GetWishlist', { wishlist: wishlistSnakeCase }));

      const client = createTestClient({ wishlistTokenStorageType: 'sessionStorage' });
      const wishlist = await client.getWishlist();
      expect(wishlist?.token).toBe(wishlistSnakeCase.token);
    });
  });
});
