import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { mockOperation, mockOperationError } from '../msw/graphql';
import {
  productViewingHistoryNotFoundError,
  productViewingHistorySnakeCase,
} from '../msw/fixtures/productViewingHistory';
import { PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY, createTestClient } from './helpers';

/**
 * Product viewing history domain — rolled out from the cart blueprint.
 * Note: only get/delete carry the still-valid recovery branch; the add path
 * auto-creates but does not retry on a 404.
 */
describe('product viewing history domain', () => {
  const KEY = PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY;
  const token = productViewingHistorySnakeCase.token;
  const seedStoredToken = (value = token) => localStorage.setItem(KEY, value);
  const asStored = undefined as unknown as string;

  describe('createProductViewingHistory', () => {
    it('creates a history and returns the camelCase result', async () => {
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'CreateProductViewingHistory',
          { createProductViewingHistory: { productViewingHistory: productViewingHistorySnakeCase } },
          info => {
            variables = info.variables;
          },
        ),
      );

      const client = createTestClient();
      const history = await client.createProductViewingHistory();

      expect(history?.token).toBe(token);
      expect(history?.createdAt).toBe(productViewingHistorySnakeCase.created_at);
      expect(history?.items[0].product.prices[0].originalAmount).toBe(3000);

      const input = variables?.product_viewing_history_input as Record<string, unknown>;
      expect(input.label).toBe('Product viewing history');
      expect(typeof input.expires_at).toBe('number');
    });
  });

  describe('getProductViewingHistory', () => {
    it('returns null when there is no token', async () => {
      const client = createTestClient();
      await expect(client.getProductViewingHistory(asStored)).resolves.toBeNull();
    });

    it('fetches the stored history and converts it to camelCase', async () => {
      seedStoredToken();
      server.use(
        mockOperation('GetProductViewingHistory', { productViewingHistory: productViewingHistorySnakeCase }),
      );

      const client = createTestClient();
      const history = await client.getProductViewingHistory(asStored);
      expect(history?.token).toBe(token);
    });

    it('drops the stored token and returns null on a 404', async () => {
      seedStoredToken();
      server.use(
        mockOperationError('GetProductViewingHistory', [productViewingHistoryNotFoundError]),
      );

      const client = createTestClient();
      await expect(client.getProductViewingHistory(asStored)).resolves.toBeNull();
      expect(localStorage.getItem(KEY)).toBeNull();
    });

    it('propagates the error for an explicitly passed token (no recovery)', async () => {
      seedStoredToken();
      server.use(
        mockOperationError('GetProductViewingHistory', [productViewingHistoryNotFoundError]),
      );

      const client = createTestClient();
      await expect(client.getProductViewingHistory('PVH_explicit')).rejects.toBeDefined();
      expect(localStorage.getItem(KEY)).toBe(token);
    });
  });

  describe('addProductViewingHistoryItem — autoCreate flow', () => {
    const item = { sku: 'SKU-1', expiresAt: 1702592000, viewedAt: 1700000000 };

    it('auto-creates a history first when no token exists, then adds the item', async () => {
      const operations: string[] = [];
      let addVariables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'CreateProductViewingHistory',
          { createProductViewingHistory: { productViewingHistory: productViewingHistorySnakeCase } },
          () => operations.push('CreateProductViewingHistory'),
        ),
        mockOperation(
          'AddItemToProductViewingHistory',
          { addItemToProductViewingHistory: { productViewingHistory: productViewingHistorySnakeCase } },
          info => {
            operations.push('AddItemToProductViewingHistory');
            addVariables = info.variables;
          },
        ),
      );

      const client = createTestClient();
      const history = await client.addProductViewingHistoryItem(item, asStored);

      expect(operations).toEqual([
        'CreateProductViewingHistory',
        'AddItemToProductViewingHistory',
      ]);
      expect(history?.token).toBe(token);
      expect(JSON.stringify(addVariables)).not.toMatch(/auto_?create/i);
    });

    it('with autoCreateProductViewingHistory off, does not create a history', async () => {
      const created: string[] = [];
      server.use(
        mockOperation(
          'CreateProductViewingHistory',
          { createProductViewingHistory: { productViewingHistory: productViewingHistorySnakeCase } },
          () => created.push('CreateProductViewingHistory'),
        ),
        mockOperation(
          'AddItemToProductViewingHistory',
          { addItemToProductViewingHistory: { productViewingHistory: productViewingHistorySnakeCase } },
        ),
      );

      const client = createTestClient({ autoCreateProductViewingHistory: false });
      await client.addProductViewingHistoryItem(item, asStored);
      expect(created).toEqual([]);
    });
  });

  describe('deleteProductViewingHistory', () => {
    it('rejects when there is no token', async () => {
      const client = createTestClient();
      await expect(client.deleteProductViewingHistory(asStored)).rejects.toThrow(
        'No product viewing history token provided',
      );
    });

    it('deletes the history and returns success', async () => {
      seedStoredToken();
      server.use(
        mockOperation('DeleteProductViewingHistory', { deleteProductViewingHistory: { success: true } }),
      );

      const client = createTestClient();
      await expect(client.deleteProductViewingHistory(asStored)).resolves.toBe(true);
    });
  });

  describe('storageType validation', () => {
    it('throws for an invalid history token storage type', () => {
      expect(() =>
        // @ts-expect-error invalid storage type on purpose
        createTestClient({ productViewingHistoryTokenStorageType: 'indexedDB' }),
      ).toThrow(/Invalid storage type/);
    });
  });
});
