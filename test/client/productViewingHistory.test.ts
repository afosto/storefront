import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../msw/server';
import { type CapturedRequest, mockOperation } from '../msw/graphql';
import { productViewingHistorySnakeCase } from '../msw/fixtures/productViewingHistory';
import { PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY as KEY, createTestClient } from './helpers';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-01-01T00:00:00.000Z').getTime();

/**
 * Product viewing history domain. Unlike the cart and wishlist, adding an item
 * auto-creates a history but does not retry on a 404. Shared stale-token
 * recovery lives in recovery.test.ts.
 */
describe('product viewing history', () => {
  const TOKEN = productViewingHistorySnakeCase.token;
  // The token parameters are typed as required, but fall back to the stored token.
  const STORED = undefined as unknown as string;
  const seedStoredToken = () => localStorage.setItem(KEY, TOKEN);
  const historyResponse = { productViewingHistory: productViewingHistorySnakeCase };

  const record = () => {
    const requests: CapturedRequest[] = [];
    return { requests, push: (info: CapturedRequest) => requests.push(info) };
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createProductViewingHistory', () => {
    it('sends the default label and expiry, stores the token and returns the camelCase history', async () => {
      vi.useFakeTimers({ toFake: ['Date'], now: NOW });
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'CreateProductViewingHistory',
          { createProductViewingHistory: historyResponse },
          i => {
            variables = i.variables;
          },
        ),
      );

      const history = await createTestClient().createProductViewingHistory();

      expect(variables?.product_viewing_history_input).toEqual({
        label: 'Product viewing history',
        expires_at: NOW + 30 * DAY,
      });
      expect(localStorage.getItem(KEY)).toBe(TOKEN);
      expect(history?.token).toBe(TOKEN);
      expect(history?.items[0].product.prices[0].originalAmount).toBe(3000);
    });
  });

  describe('getProductViewingHistory', () => {
    it('returns null without a request when there is no token', async () => {
      await expect(createTestClient().getProductViewingHistory(STORED)).resolves.toBeNull();
    });

    it('fetches the history for the stored token', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('GetProductViewingHistory', historyResponse, i => {
          variables = i.variables;
        }),
      );

      const history = await createTestClient().getProductViewingHistory(STORED);

      expect(variables).toEqual({ token: TOKEN });
      expect(history?.token).toBe(TOKEN);
    });
  });

  describe('updateProductViewingHistory', () => {
    it('rejects when there is no token', async () => {
      await expect(
        createTestClient().updateProductViewingHistory({ label: 'New', expiresAt: 1702592000 }),
      ).rejects.toThrow('No product viewing history to update');
    });

    it('updates the stored history', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'UpdateProductViewingHistory',
          { updateProductViewingHistory: historyResponse },
          i => {
            variables = i.variables;
          },
        ),
      );

      await createTestClient().updateProductViewingHistory({
        label: 'Renamed',
        expiresAt: 1702592000,
      });

      expect(variables?.product_viewing_history_input).toEqual({
        token: TOKEN,
        label: 'Renamed',
        expires_at: 1702592000,
      });
    });
  });

  describe('addProductViewingHistoryItem', () => {
    const item = { sku: 'SKU-1', expiresAt: 1702592000, viewedAt: 1700000000 };

    it('auto-creates a history when there is no token, then adds the item to it', async () => {
      const { requests, push } = record();
      server.use(
        mockOperation(
          'CreateProductViewingHistory',
          { createProductViewingHistory: historyResponse },
          push,
        ),
        mockOperation(
          'AddItemToProductViewingHistory',
          { addItemToProductViewingHistory: historyResponse },
          push,
        ),
      );

      const history = await createTestClient().addProductViewingHistoryItem(item, STORED);

      expect(requests.map(r => r.operationName)).toEqual([
        'CreateProductViewingHistory',
        'AddItemToProductViewingHistory',
      ]);
      expect(requests[1].variables.product_viewing_history_input).toEqual({
        sku: 'SKU-1',
        expires_at: 1702592000,
        viewed_at: 1700000000,
        token: TOKEN,
      });
      expect(history?.token).toBe(TOKEN);
    });

    it('defaults the item expiry to the configured number of days', async () => {
      vi.useFakeTimers({ toFake: ['Date'], now: NOW });
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'AddItemToProductViewingHistory',
          { addItemToProductViewingHistory: historyResponse },
          i => {
            variables = i.variables;
          },
        ),
      );

      await createTestClient({
        productViewingHistoryDefaultExpiresInDays: 7,
      }).addProductViewingHistoryItem({ sku: 'SKU-1', viewedAt: 1 } as typeof item, STORED);

      expect(variables?.product_viewing_history_input).toMatchObject({
        expires_at: NOW + 7 * DAY,
        token: TOKEN,
      });
    });

    it('with autoCreateProductViewingHistory off, does not create a history', async () => {
      const { requests, push } = record();
      server.use(
        mockOperation(
          'CreateProductViewingHistory',
          { createProductViewingHistory: historyResponse },
          push,
        ),
        mockOperation(
          'AddItemToProductViewingHistory',
          { addItemToProductViewingHistory: historyResponse },
          push,
        ),
      );

      await createTestClient({
        autoCreateProductViewingHistory: false,
      }).addProductViewingHistoryItem(item, STORED);

      expect(requests.map(r => r.operationName)).toEqual(['AddItemToProductViewingHistory']);
    });
  });

  describe('deleteProductViewingHistory', () => {
    it('rejects when there is no token', async () => {
      await expect(createTestClient().deleteProductViewingHistory(STORED)).rejects.toThrow(
        'No product viewing history token provided',
      );
    });

    it('deletes the stored history and reports success', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'DeleteProductViewingHistory',
          { deleteProductViewingHistory: { success: true } },
          i => {
            variables = i.variables;
          },
        ),
      );

      await expect(createTestClient().deleteProductViewingHistory(STORED)).resolves.toBe(true);
      expect(variables?.product_viewing_history_input).toEqual({ token: TOKEN });
    });
  });
});
