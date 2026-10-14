import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { mockOperation } from '../msw/graphql';
import { validUserToken } from '../msw/fixtures/auth';
import { STOREFRONT_TOKEN, createSignedInClient, createTestClient } from './helpers';

/**
 * Remaining auth methods: password management, verification and switching in
 * and out of an organisation. Public methods use the storefront token; the
 * organisation ones use the user token via authenticatedRequest.
 */
describe('auth — password, verification & organisation', () => {
  it('changePassword returns true when the account email comes back', async () => {
    server.use(
      mockOperation('ChangePasswordMutation', {
        setPasswordForAccount: { account: { email: 'ada@example.com' } },
      }),
    );

    const { client } = createSignedInClient();
    await expect(
      client.changePassword({ password: 'old', newPassword: 'new' }),
    ).resolves.toBe(true);
  });

  it('requestPasswordReset returns the success flag', async () => {
    let captured: Request | undefined;
    server.use(
      mockOperation(
        'RequestPasswordResetMutation',
        { requestCustomerPasswordReset: { is_successful: true } },
        info => {
          captured = info.request;
        },
      ),
    );

    const client = createTestClient();
    await expect(client.requestPasswordReset({ email: 'ada@example.com' })).resolves.toBe(true);
    expect(captured?.headers.get('authorization')).toBe(`Bearer ${STOREFRONT_TOKEN}`);
  });

  it('requestUserVerification returns the success flag', async () => {
    server.use(
      mockOperation('RequestPasswordResetMutation', {
        requestCustomerVerificationLink: { is_successful: true },
      }),
    );

    const client = createTestClient();
    await expect(client.requestUserVerification({ email: 'ada@example.com' })).resolves.toBe(true);
  });

  it('resetPassword returns the success flag', async () => {
    server.use(
      mockOperation('ResetPasswordMutation', {
        resetCustomerPassword: { is_successful: true },
      }),
    );

    const client = createTestClient();
    await expect(client.resetPassword({ token: 'RT_1', password: 'new' })).resolves.toBe(true);
  });

  it('verifyUser stores the returned token and returns the user', async () => {
    const token = validUserToken();
    server.use(mockOperation('VerifyUserMutation', { verifyCustomer: { token } }));

    const client = createTestClient();
    const user = await client.verifyUser({ token: 'VT_1' });
    expect(user?.email).toBe('ada@example.com');
    expect(client.getUserToken()).toBe(token);
  });

  it('verifyUser rejects when the returned token is invalid', async () => {
    server.use(mockOperation('VerifyUserMutation', { verifyCustomer: { token: undefined } }));

    const client = createTestClient();
    await expect(client.verifyUser({ token: 'VT_1' })).rejects.toBe('Invalid user token');
  });

  it('signInAsOrganisation swaps the token using the user token', async () => {
    const orgToken = validUserToken();
    let captured: Request | undefined;
    const { client, userToken } = createSignedInClient();
    server.use(
      mockOperation('SignInAsOrganisation', { logInAsOrganisation: { token: orgToken } }, info => {
        captured = info.request;
      }),
    );

    const user = await client.signInAsOrganisation({ organisationId: 'OR_2' });
    expect(user?.id).toBeTruthy();
    expect(captured?.headers.get('authorization')).toBe(`Bearer ${userToken}`);
    expect(client.getUserToken()).toBe(orgToken);
  });

  it('signInAsOrganisation rejects when the returned token is invalid', async () => {
    const { client } = createSignedInClient();
    server.use(
      mockOperation('SignInAsOrganisation', { logInAsOrganisation: { token: undefined } }),
    );
    await expect(client.signInAsOrganisation({ organisationId: 'OR_2' })).rejects.toBe(
      'Invalid user token',
    );
  });

  it('signOutOfOrganisation swaps back to the account token', async () => {
    const accountToken = validUserToken();
    const { client } = createSignedInClient();
    server.use(
      mockOperation('SignOutOfOrganisation', { logOutAsOrganisation: { token: accountToken } }),
    );

    const user = await client.signOutOfOrganisation();
    expect(user?.id).toBeTruthy();
    expect(client.getUserToken()).toBe(accountToken);
  });

  it('signOutOfOrganisation rejects when the returned token is invalid', async () => {
    const { client } = createSignedInClient();
    server.use(
      mockOperation('SignOutOfOrganisation', { logOutAsOrganisation: { token: undefined } }),
    );
    await expect(client.signOutOfOrganisation()).rejects.toBe('Invalid user token');
  });

  it('updateAccountInformation returns the updated account', async () => {
    server.use(
      mockOperation('UpdateAccountInformationMutation', {
        updateAccount: { account: { id: 'AC_1', given_name: 'Ada' } },
      }),
    );

    const { client } = createSignedInClient();
    const account = await client.updateAccountInformation({ givenName: 'Ada' });
    expect(account?.givenName).toBe('Ada');
  });
});
