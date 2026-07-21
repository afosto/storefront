import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { mockOperation } from '../msw/graphql';
import { createSignedInClient } from './helpers';

/**
 * RMA (Return Merchandise Authorization) domain. All methods run over the user
 * token. createAccountRma branches on whether items are supplied.
 */
describe('rma domain', () => {
  describe('createAccountRma', () => {
    it('creates an RMA without items via createRma', async () => {
      const operations: string[] = [];
      server.use(
        mockOperation('CreateAccountRma', { createRma: { rma: { id: 'RMA_1', status: 'OPEN' } } }, () =>
          operations.push('CreateAccountRma'),
        ),
      );
      const { client } = createSignedInClient();
      const rma = await client.createAccountRma({ orderId: 'OR_1' });
      expect(rma?.id).toBe('RMA_1');
      expect(operations).toEqual(['CreateAccountRma']);
    });

    it('creates an RMA with items via createRmaItems and a generated id', async () => {
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'CreateAccountRmaWithItems',
          { createRmaItems: { rma: { id: 'RMA_2' } } },
          info => {
            variables = info.variables;
          },
        ),
      );
      const { client } = createSignedInClient();
      const rma = await client.createAccountRma({ orderId: 'OR_1', items: [{ sku: 'SKU-1' }] });
      expect(rma?.id).toBe('RMA_2');
      // A shared rma id is generated and threaded into both inputs.
      const input = variables?.input as Record<string, unknown>;
      const itemsInput = variables?.items_input as Record<string, unknown>;
      expect(typeof input.id).toBe('string');
      expect(itemsInput.rma_id).toBe(input.id);
    });
  });

  it('getAccountRmas returns rmas and pageInfo', async () => {
    server.use(
      mockOperation('GetAccountRmas', {
        rmas: { nodes: [{ id: 'RMA_1' }], pageInfo: { has_next_page: false } },
      }),
    );
    const { client } = createSignedInClient();
    const { rmas, pageInfo } = await client.getAccountRmas();
    expect(rmas).toHaveLength(1);
    expect(pageInfo.hasNextPage).toBe(false);
  });

  it('getAccountRmas defaults to empty collections', async () => {
    server.use(mockOperation('GetAccountRmas', {}));
    const { client } = createSignedInClient();
    const { rmas, pageInfo } = await client.getAccountRmas();
    expect(rmas).toEqual([]);
    expect(pageInfo).toEqual({});
  });

  it('getAccountRma returns a single RMA', async () => {
    server.use(mockOperation('GetAccountRma', { rma: { id: 'RMA_1', status: 'OPEN' } }));
    const { client } = createSignedInClient();
    const rma = await client.getAccountRma('RMA_1');
    expect(rma?.id).toBe('RMA_1');
  });

  it('updateAccountRma returns the updated RMA', async () => {
    server.use(mockOperation('UpdateAccountRma', { updateRma: { rma: { id: 'RMA_1' } } }));
    const { client } = createSignedInClient();
    const rma = await client.updateAccountRma({ id: 'RMA_1' });
    expect(rma?.id).toBe('RMA_1');
  });

  it('deleteAccountRma returns the success flag', async () => {
    server.use(mockOperation('DeleteAccountRma', { deleteRma: { is_successful: true } }));
    const { client } = createSignedInClient();
    await expect(client.deleteAccountRma('RMA_1')).resolves.toBe(true);
  });

  it('createAccountRmaItems returns the RMA', async () => {
    server.use(mockOperation('CreateAccountRmaItems', { createRmaItems: { rma: { id: 'RMA_1' } } }));
    const { client } = createSignedInClient();
    const rma = await client.createAccountRmaItems({ rmaId: 'RMA_1', items: [{ sku: 'SKU-1' }] });
    expect(rma?.id).toBe('RMA_1');
  });

  it('deleteAccountRmaItems returns the RMA', async () => {
    server.use(mockOperation('DeleteAccountRmaItems', { deleteRmaItems: { rma: { id: 'RMA_1' } } }));
    const { client } = createSignedInClient();
    const rma = await client.deleteAccountRmaItems({ rmaId: 'RMA_1', ids: ['RI_1'] });
    expect(rma?.id).toBe('RMA_1');
  });

  it('updateAccountRmaItems returns the RMA', async () => {
    server.use(mockOperation('UpdateAccountRmaItems', { updateRmaItems: { rma: { id: 'RMA_1' } } }));
    const { client } = createSignedInClient();
    const rma = await client.updateAccountRmaItems({ rmaId: 'RMA_1', items: [] });
    expect(rma?.id).toBe('RMA_1');
  });

  it('searchAccountRmaItems returns items and pageInfo', async () => {
    server.use(
      mockOperation('SearchAccountRmaItems', {
        searchRmaItems: { nodes: [{ id: 'RI_1' }], pageInfo: { has_next_page: true } },
      }),
    );
    const { client } = createSignedInClient();
    const { items, pageInfo } = await client.searchAccountRmaItems({ orderId: 'OR_1' });
    expect(items).toHaveLength(1);
    expect(pageInfo.hasNextPage).toBe(true);
  });
});
