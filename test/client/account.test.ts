import { describe, expect, it } from 'vitest';
import Cookies from 'js-cookie';
import { server } from '../msw/server';
import { mockOperation } from '../msw/graphql';
import { makeUserJwt, oneHourFromNow } from '../msw/fixtures/auth';
import { USER_TOKEN_COOKIE_KEY, createSignedInClient, createTestClient } from './helpers';

/**
 * Account domain: only the methods that do more than pass a response through.
 * Which token each account method sends is covered in authorization.test.ts.
 */
describe('account', () => {
  it('getAccountOrders forwards the pagination and maps nodes to orders', async () => {
    let variables: Record<string, unknown> | undefined;
    server.use(
      mockOperation(
        'GetAccountOrders',
        {
          account: {
            orders: {
              nodes: [{ id: 'OR_1', number: '1001' }],
              pageInfo: { has_next_page: true, end_cursor: 'C_1' },
            },
          },
        },
        i => {
          variables = i.variables;
        },
      ),
    );
    const { client } = createSignedInClient();

    const { orders, pageInfo } = await client.getAccountOrders({ first: 10, after: 'C_0' });

    expect(variables).toEqual({ first: 10, after: 'C_0' });
    expect(orders).toEqual([{ id: 'OR_1', number: '1001' }]);
    expect(pageInfo).toEqual({ hasNextPage: true, endCursor: 'C_1' });
  });

  it('getChannel sends an explicit channel id', async () => {
    let variables: Record<string, unknown> | undefined;
    server.use(
      mockOperation('GetChannel', { channel: { id: 'CH_2' } }, i => {
        variables = i.variables;
      }),
    );

    const channel = await createTestClient().getChannel('CH_2');

    expect(variables).toEqual({ id: 'CH_2' });
    expect(channel?.id).toBe('CH_2');
  });

  describe('organisation membership', () => {
    const organisations = {
      account: {
        sharedOrganisations: [
          {
            id: 'OR_1',
            sharedContacts: [{ role: 'admin', contact: { id: 'CU_9', given_name: 'Grace' } }],
          },
          { id: 'OR_2', sharedContacts: [{ role: 'user', contact: { id: 'CU_8' } }] },
        ],
      },
    };

    it('returns the users of the organisation the user is signed in to', async () => {
      // validUserToken carries organisation_id 'OR_1'.
      server.use(mockOperation('GetAccountOrganisationUsers', organisations));
      const { client } = createSignedInClient();

      const { users } = await client.getAccountOrganisationUsers();

      expect(users).toEqual([{ role: 'admin', contact: { id: 'CU_9', givenName: 'Grace' } }]);
    });

    it('returns no users when the session has no organisation', async () => {
      Cookies.set(USER_TOKEN_COOKIE_KEY, makeUserJwt({ sub: 'CU_1', exp: oneHourFromNow() }));
      server.use(mockOperation('GetAccountOrganisationUsers', organisations));

      const { users } = await createTestClient().getAccountOrganisationUsers();

      expect(users).toEqual([]);
    });

    it.each([
      ['the given role', 'admin', 'ADMIN'],
      ['USER when no role is given', undefined, 'USER'],
    ])('inviting a user sends %s upper-cased', async (_label, role, expected) => {
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'InviteUserToAccountOrganisation',
          { addContactToAccountOrganisation: { organisation: { sharedContacts: [] } } },
          i => {
            variables = i.variables;
          },
        ),
      );
      const { client } = createSignedInClient();

      await client.inviteUserToAccountOrganisation({
        organisationId: 'OR_1',
        user: { email: 'grace@example.com', role } as { email: string; role: 'admin' },
      });

      expect(variables?.invite_user_to_account_organisation_input).toEqual({
        organisation_id: 'OR_1',
        contact: { email: 'grace@example.com', role: expected },
      });
    });

    it('updating a role sends the user id as contact id and the role upper-cased', async () => {
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'UpdateContactRoleInOrganisationMutation',
          { updateContactRoleInOrganisation: { organisation: { sharedContacts: [] } } },
          i => {
            variables = i.variables;
          },
        ),
      );
      const { client } = createSignedInClient();

      await client.updateUserRoleInAccountOrganisation({
        organisationId: 'OR_1',
        userId: 'CU_9',
        role: 'admin',
      });

      expect(variables?.update_contact_role_in_organisation_input).toEqual({
        organisation_id: 'OR_1',
        contact_id: 'CU_9',
        role: 'ADMIN',
      });
    });
  });
});
