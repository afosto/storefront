import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { mockOperation } from '../msw/graphql';
import { STOREFRONT_TOKEN, createTestClient } from './helpers';

/**
 * Stock update subscription domain. All three methods are thin wrappers over a
 * public (storefront-token) request.
 */
describe('stock update subscription domain', () => {
  it('createStockUpdateSubscription returns the camelCase subscription', async () => {
    let captured: Request | undefined;
    server.use(
      mockOperation(
        'CreateStockUpdateSubscriptionMutation',
        {
          createStockUpdateSubscription: {
            subscription: { email: 'ada@example.com' },
          },
        },
        info => {
          captured = info.request;
        },
      ),
    );

    const client = createTestClient();
    const result = await client.createStockUpdateSubscription({
      email: 'ada@example.com',
      sku: 'SKU-1',
    });

    expect(result?.subscription.email).toBe('ada@example.com');
    expect(captured?.headers.get('authorization')).toBe(`Bearer ${STOREFRONT_TOKEN}`);
  });

  it('approveStockUpdateSubscription returns the result', async () => {
    server.use(
      mockOperation('ApproveStockUpdateSubscriptionMutation', {
        approveStockUpdateSubscription: { is_successful: true },
      }),
    );

    const client = createTestClient();
    const result = await client.approveStockUpdateSubscription('STK_1');
    expect(result?.isSuccessful).toBe(true);
  });

  it('removeStockUpdateSubscription returns the result', async () => {
    server.use(
      mockOperation('RemoveStockUpdateSubscriptionMutation', {
        removeStockUpdateSubscription: { is_successful: true },
      }),
    );

    const client = createTestClient();
    const result = await client.removeStockUpdateSubscription('STK_1');
    expect(result?.isSuccessful).toBe(true);
  });
});
