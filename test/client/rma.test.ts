import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { type CapturedRequest, mockOperation } from '../msw/graphql';
import { createSignedInClient } from './helpers';

/**
 * createAccountRma picks a different mutation depending on whether items are
 * supplied; with items, one RMA id is shared by the RMA and its items.
 */
describe('createAccountRma', () => {
  const capture = () => {
    const requests: CapturedRequest[] = [];
    server.use(
      mockOperation('CreateAccountRma', { createRma: { rma: { id: 'RMA_1' } } }, i => {
        requests.push(i);
      }),
      mockOperation(
        'CreateAccountRmaWithItems',
        { createRmaItems: { rma: { id: 'RMA_2' } } },
        i => {
          requests.push(i);
        },
      ),
    );
    return requests;
  };

  it('uses createRma when there are no items', async () => {
    const requests = capture();
    const { client } = createSignedInClient();

    const rma = await client.createAccountRma({ contactId: 'CO_1' });

    expect(rma?.id).toBe('RMA_1');
    expect(requests.map(r => r.operationName)).toEqual(['CreateAccountRma']);
    expect(requests[0].variables.input).toEqual({ contact_id: 'CO_1' });
  });

  it('uses createRmaItems with a generated id shared by the RMA and its items', async () => {
    const requests = capture();
    const { client } = createSignedInClient();

    const rma = await client.createAccountRma({ items: [{ orderId: 'OR_1', sku: 'SKU-1' }] });

    expect(rma?.id).toBe('RMA_2');
    expect(requests.map(r => r.operationName)).toEqual(['CreateAccountRmaWithItems']);
    const { input, items_input: itemsInput } = requests[0].variables as Record<
      string,
      Record<string, unknown>
    >;
    expect(input.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(itemsInput).toEqual({ rma_id: input.id, items: [{ order_id: 'OR_1', sku: 'SKU-1' }] });
  });

  it('uses an explicitly given id instead of generating one', async () => {
    const requests = capture();
    const { client } = createSignedInClient();

    await client.createAccountRma({ id: 'RMA_X', items: [{ orderId: 'OR_1', sku: 'SKU-1' }] });

    expect(requests[0].variables).toMatchObject({
      input: { id: 'RMA_X' },
      items_input: { rma_id: 'RMA_X' },
    });
  });
});
