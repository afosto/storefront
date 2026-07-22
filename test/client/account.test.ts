import { describe, expect, it } from 'vitest';
import Cookies from 'js-cookie';
import { server } from '../msw/server';
import { mockOperation } from '../msw/graphql';
import { makeUserJwt, oneHourFromNow } from '../msw/fixtures/auth';
import {
  STOREFRONT_TOKEN,
  USER_TOKEN_COOKIE_KEY,
  createSignedInClient,
  createTestClient,
} from './helpers';

/**
 * Account domain: order history, account info, organisation membership and the
 * public order/channel lookups. Account methods use the user token; getOrder
 * and getChannel are public (storefront token).
 */
describe('account domain', () => {
  describe('account info & balance', () => {
    it('getAccountInformation returns the account (camelCase)', async () => {
      server.use(
        mockOperation('GetAccountInformation', {
          account: { id: 'AC_1', given_name: 'Ada', family_name: 'Lovelace' },
        }),
      );
      const { client } = createSignedInClient();
      const account = await client.getAccountInformation();
      expect(account?.givenName).toBe('Ada');
      expect(account?.familyName).toBe('Lovelace');
    });

    it('getAccountBalance returns the balance', async () => {
      server.use(
        mockOperation('GetAccountBalance', {
          account: { balance: { available_balance: 12345, spending_limit: 0, used_balance: 0 } },
        }),
      );
      const { client } = createSignedInClient();
      const balance = await client.getAccountBalance();
      expect(balance?.availableBalance).toBe(12345);
    });

    it('getAccountBalance returns null when there is no balance', async () => {
      server.use(mockOperation('GetAccountBalance', { account: {} }));
      const { client } = createSignedInClient();
      await expect(client.getAccountBalance()).resolves.toBeNull();
    });
  });

  describe('orders', () => {
    it('getAccountOrder returns a single order', async () => {
      let captured: Request | undefined;
      server.use(
        mockOperation('GetAccountOrder', { account: { order: { id: 'OR_1', number: '1001' } } }, info => {
          captured = info.request;
        }),
      );
      const { client, userToken } = createSignedInClient();
      const order = await client.getAccountOrder('OR_1');
      expect(order?.number).toBe('1001');
      expect(captured?.headers.get('authorization')).toBe(`Bearer ${userToken}`);
    });

    it('getAccountOrders returns orders and pageInfo', async () => {
      server.use(
        mockOperation('GetAccountOrders', {
          account: {
            orders: {
              nodes: [{ id: 'OR_1', number: '1001' }],
              pageInfo: { has_next_page: false, end_cursor: null },
            },
          },
        }),
      );
      const { client } = createSignedInClient();
      const { orders, pageInfo } = await client.getAccountOrders({ first: 10 });
      expect(orders).toHaveLength(1);
      expect(orders[0].number).toBe('1001');
      expect(pageInfo.hasNextPage).toBe(false);
    });

    it('getAccountOrders defaults orders and pageInfo to empty', async () => {
      server.use(mockOperation('GetAccountOrders', { account: {} }));
      const { client } = createSignedInClient();
      const { orders, pageInfo } = await client.getAccountOrders();
      expect(orders).toEqual([]);
      expect(pageInfo).toEqual({});
    });

    it('getAccountOutstandingOrders returns the outstanding orders', async () => {
      server.use(
        mockOperation('GetAccountOutstandingOrders', {
          account: { outstandingOrders: [{ id: 'OR_1' }] },
        }),
      );
      const { client } = createSignedInClient();
      const { orders } = await client.getAccountOutstandingOrders();
      expect(orders).toHaveLength(1);
    });

    it('reorderAccountOrder returns the resulting cart', async () => {
      server.use(mockOperation('Reorder', { reorder: { cart: { id: 'CA_1', total: 5000 } } }));
      const { client } = createSignedInClient();
      const cart = await client.reorderAccountOrder({ orderId: 'OR_1' });
      expect(cart?.id).toBe('CA_1');
    });

    it('getOrder is a public lookup (storefront token)', async () => {
      let captured: Request | undefined;
      server.use(
        mockOperation('GetOrder', { order: { id: 'OR_1', number: '1001' } }, info => {
          captured = info.request;
        }),
      );
      const client = createTestClient();
      const order = await client.getOrder('OR_1');
      expect(order?.number).toBe('1001');
      expect(captured?.headers.get('authorization')).toBe(`Bearer ${STOREFRONT_TOKEN}`);
    });
  });

  describe('projects', () => {
    it('getAccountProjects returns the projects', async () => {
      server.use(
        mockOperation('GetAccountProjects', { account: { projects: [{ id: 'PR_1' }] } }),
      );
      const { client } = createSignedInClient();
      const { projects } = await client.getAccountProjects();
      expect(projects[0].id).toBe('PR_1');
    });
  });

  describe('channel', () => {
    it('getChannel returns the channel for the storefront token', async () => {
      server.use(mockOperation('GetChannel', { channel: { id: 'CH_1', name: 'Web' } }));
      const client = createTestClient();
      const channel = await client.getChannel();
      expect(channel?.id).toBe('CH_1');
    });

    it('getChannel accepts an explicit id', async () => {
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('GetChannel', { channel: { id: 'CH_2' } }, info => {
          variables = info.variables;
        }),
      );
      const client = createTestClient();
      const channel = await client.getChannel('CH_2');
      expect(channel?.id).toBe('CH_2');
      expect(variables?.id).toBe('CH_2');
    });
  });

  describe('organisation membership', () => {
    it('getAccountOrganisationUsers returns the users of the signed-in organisation', async () => {
      // validUserToken carries organisation_id 'OR_1'.
      server.use(
        mockOperation('GetAccountOrganisationUsers', {
          account: {
            sharedOrganisations: [
              {
                id: 'OR_1',
                sharedContacts: [{ role: 'admin', contact: { id: 'CU_9', given_name: 'Grace' } }],
              },
              { id: 'OR_2', sharedContacts: [] },
            ],
          },
        }),
      );
      const { client } = createSignedInClient();
      const { users } = await client.getAccountOrganisationUsers();
      expect(users).toHaveLength(1);
      expect(users[0].contact.givenName).toBe('Grace');
    });

    it('getAccountOrganisationUsers returns no users when the session has no organisation', async () => {
      Cookies.set(USER_TOKEN_COOKIE_KEY, makeUserJwt({ sub: 'CU_1', exp: oneHourFromNow() }));
      server.use(
        mockOperation('GetAccountOrganisationUsers', {
          account: { sharedOrganisations: [{ id: 'OR_1', sharedContacts: [{ id: 'CU_9' }] }] },
        }),
      );
      const client = createTestClient();
      const { users } = await client.getAccountOrganisationUsers();
      expect(users).toEqual([]);
    });

    it('inviteUserToAccountOrganisation returns the updated user list', async () => {
      server.use(
        mockOperation('InviteUserToAccountOrganisation', {
          addContactToAccountOrganisation: { organisation: { sharedContacts: [{ id: 'CU_9' }] } },
        }),
      );
      const { client } = createSignedInClient();
      const { users } = await client.inviteUserToAccountOrganisation({
        organisationId: 'OR_1',
        user: { email: 'grace@example.com', role: 'user' },
      });
      expect(users).toHaveLength(1);
    });

    it('updateUserRoleInAccountOrganisation returns the updated user list', async () => {
      server.use(
        mockOperation('UpdateContactRoleInOrganisationMutation', {
          updateContactRoleInOrganisation: { organisation: { sharedContacts: [{ id: 'CU_9' }] } },
        }),
      );
      const { client } = createSignedInClient();
      const { users } = await client.updateUserRoleInAccountOrganisation({
        organisationId: 'OR_1',
        userId: 'CU_9',
        role: 'admin',
      });
      expect(users).toHaveLength(1);
    });

    it('removeUserFromAccountOrganisation returns the updated user list', async () => {
      server.use(
        mockOperation('RemoveUserFromAccountOrganisation', {
          removeContactFromAccountOrganisation: { organisation: { sharedContacts: [] } },
        }),
      );
      const { client } = createSignedInClient();
      const { users } = await client.removeUserFromAccountOrganisation({
        organisationId: 'OR_1',
        userId: 'CU_9',
      });
      expect(users).toEqual([]);
    });

    it('updateOrganisationOnAccount returns the updated account', async () => {
      server.use(
        mockOperation('UpdateOrganisationOnAccountMutation', {
          updateOrganisationOnAccount: { account: { given_name: 'Ada' } },
        }),
      );
      const { client } = createSignedInClient();
      const account = await client.updateOrganisationOnAccount({
        name: 'New name',
      } as Parameters<typeof client.updateOrganisationOnAccount>[0]);
      expect(account?.givenName).toBe('Ada');
    });
  });
});
