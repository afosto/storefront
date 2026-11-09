import { describe, expect, it } from 'vitest';
import Cookies from 'js-cookie';
import { server } from '../msw/server';
import { type CapturedRequest, mockOperation } from '../msw/graphql';
import {
  expiredUserToken,
  makeUserJwt,
  oneHourFromNow,
  tokenWithoutSub,
  validUserToken,
} from '../msw/fixtures/auth';
import {
  STOREFRONT_TOKEN,
  USER_TOKEN_COOKIE_KEY,
  createSignedInClient,
  createTestClient,
} from './helpers';

/**
 * Auth / user-token domain. Session validity is decided fully client-side from
 * the JWT (`exp` + `sub`); there is no server-side 401/403 path. The user token
 * always lives in the `af-sid` cookie, independent of the storage type options.
 */
describe('auth / user token', () => {
  const seedUserCookie = (token: string) => Cookies.set(USER_TOKEN_COOKIE_KEY, token);

  describe('validateUserToken', () => {
    it.each([
      ['a token with a future exp and a sub', validUserToken(), true],
      ['an expired token', expiredUserToken(), false],
      ['a token without a sub', tokenWithoutSub(), false],
      ['a token without an exp', makeUserJwt({ sub: 'CU_1' }), false],
      ['an empty token', '', false],
      ['a malformed token', 'not.a.jwt', false],
    ])('%s → %s', (_label, token, expected) => {
      expect(Boolean(createTestClient().validateUserToken(token))).toBe(expected);
    });
  });

  describe('initializeUserToken (on client creation)', () => {
    it('keeps a valid token found in the cookie', () => {
      const token = validUserToken();
      seedUserCookie(token);

      const client = createTestClient();

      expect(client.getUserToken()).toBe(token);
      expect(client.getUser()?.id).toBe('CU_00000000-0000-4000-8000-000000000001');
    });

    it.each([
      ['an expired', expiredUserToken()],
      ['a malformed', 'garbage'],
    ])('removes %s token from the cookie without throwing', (_label, token) => {
      seedUserCookie(token);

      const client = createTestClient();

      expect(client.getUserToken()).toBeNull();
      expect(client.getUser()).toBeNull();
      expect(Cookies.get(USER_TOKEN_COOKIE_KEY)).toBeUndefined();
    });

    it('ignores the cookie when storeUserToken is disabled', () => {
      seedUserCookie(validUserToken());

      expect(createTestClient({ storeUserToken: false }).getUserToken()).toBeNull();
    });
  });

  describe('getUser', () => {
    it('maps the JWT claims (which bypass the camelCase conversion)', () => {
      seedUserCookie(validUserToken());

      expect(createTestClient().getUser()).toEqual({
        id: 'CU_00000000-0000-4000-8000-000000000001',
        email: 'ada@example.com',
        familyName: 'Lovelace',
        givenName: 'Ada',
        name: 'Ada Lovelace',
        organisation: {
          id: 'OR_1',
          name: 'Analytical Engines',
          role: 'admin', // contact_role is lower-cased
        },
      });
    });

    it('fills organisation defaults when name and role are absent', () => {
      seedUserCookie(makeUserJwt({ sub: 'CU_1', exp: oneHourFromNow(), organisation_id: 'OR_1' }));

      expect(createTestClient().getUser()?.organisation).toEqual({
        id: 'OR_1',
        name: '',
        role: 'user',
      });
    });

    it('returns a null organisation when the token has none', () => {
      seedUserCookie(makeUserJwt({ sub: 'CU_1', exp: oneHourFromNow() }));

      expect(createTestClient().getUser()?.organisation).toBeNull();
    });

    it('returns null when there is no user token', () => {
      expect(createTestClient().getUser()).toBeNull();
    });
  });

  describe('signIn / signUp / verifyUser', () => {
    it('signIn sends the credentials, stores the token in the cookie and returns the user', async () => {
      const token = validUserToken();
      let captured: CapturedRequest | undefined;
      server.use(
        mockOperation('SignInMutation', { logInCustomer: { token } }, info => {
          captured = info;
        }),
      );

      const client = createTestClient();
      const user = await client.signIn({ email: 'ada@example.com', password: 'secret' });

      expect(user?.email).toBe('ada@example.com');
      expect(client.getUserToken()).toBe(token);
      expect(Cookies.get(USER_TOKEN_COOKIE_KEY)).toBe(token);
      expect(captured?.authorization).toBe(`Bearer ${STOREFRONT_TOKEN}`);
      expect(captured?.variables.sign_in_input).toEqual({
        email: 'ada@example.com',
        password: 'secret',
      });
    });

    it('signUp stores the token and only forwards the known input fields', async () => {
      const token = validUserToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('SignUpMutation', { registerCustomer: { token } }, info => {
          variables = info.variables;
        }),
      );

      const client = createTestClient();
      const user = await client.signUp({
        givenName: 'Ada',
        familyName: 'Lovelace',
        email: 'ada@example.com',
        password: 'secret',
        isAdmin: true,
      } as Parameters<typeof client.signUp>[0]);

      expect(user?.givenName).toBe('Ada');
      expect(client.getUserToken()).toBe(token);
      expect(variables?.sign_up_input).toEqual({
        given_name: 'Ada',
        family_name: 'Lovelace',
        email: 'ada@example.com',
        password: 'secret',
      });
    });

    it('verifyUser stores the returned token and returns the user', async () => {
      const token = validUserToken();
      server.use(mockOperation('VerifyUserMutation', { verifyCustomer: { token } }));

      const client = createTestClient();
      const user = await client.verifyUser({ token: 'VT_1' });

      expect(user?.email).toBe('ada@example.com');
      expect(client.getUserToken()).toBe(token);
    });
  });

  describe('organisation sessions', () => {
    it('signInAsOrganisation swaps the token, authenticating with the current user token', async () => {
      const orgToken = makeUserJwt({ sub: 'CU_1', exp: oneHourFromNow(), organisation_id: 'OR_2' });
      let captured: CapturedRequest | undefined;
      const { client, userToken } = createSignedInClient();
      server.use(
        mockOperation(
          'SignInAsOrganisation',
          { logInAsOrganisation: { token: orgToken } },
          info => {
            captured = info;
          },
        ),
      );

      const user = await client.signInAsOrganisation({ organisationId: 'OR_2' });

      expect(user?.organisation?.id).toBe('OR_2');
      expect(captured?.authorization).toBe(`Bearer ${userToken}`);
      expect(client.getUserToken()).toBe(orgToken);
      expect(Cookies.get(USER_TOKEN_COOKIE_KEY)).toBe(orgToken);
    });

    it('signOutOfOrganisation swaps back to the account token', async () => {
      const accountToken = makeUserJwt({ sub: 'CU_1', exp: oneHourFromNow() });
      let captured: CapturedRequest | undefined;
      const { client, userToken } = createSignedInClient();
      server.use(
        mockOperation(
          'SignOutOfOrganisation',
          { logOutAsOrganisation: { token: accountToken } },
          info => {
            captured = info;
          },
        ),
      );

      const user = await client.signOutOfOrganisation();

      expect(user?.organisation).toBeNull();
      expect(captured?.authorization).toBe(`Bearer ${userToken}`);
      expect(client.getUserToken()).toBe(accountToken);
    });
  });

  describe('a missing or invalid token in the response', () => {
    type Client = ReturnType<typeof createTestClient>;
    const cases: [string, string, string, (client: Client) => Promise<unknown>][] = [
      ['signIn', 'SignInMutation', 'logInCustomer', c => c.signIn({ email: 'a', password: 'b' })],
      [
        'signUp',
        'SignUpMutation',
        'registerCustomer',
        c => c.signUp({ email: 'a', password: 'b', givenName: 'A', familyName: 'B' }),
      ],
      ['verifyUser', 'VerifyUserMutation', 'verifyCustomer', c => c.verifyUser({ token: 'VT' })],
      [
        'signInAsOrganisation',
        'SignInAsOrganisation',
        'logInAsOrganisation',
        c => c.signInAsOrganisation({ organisationId: 'OR_2' }),
      ],
      [
        'signOutOfOrganisation',
        'SignOutOfOrganisation',
        'logOutAsOrganisation',
        c => c.signOutOfOrganisation(),
      ],
    ];

    describe.each([
      ['expired', expiredUserToken()],
      ['missing', undefined],
    ])('when the token is %s', (_label, returnedToken) => {
      it.each(cases)(
        '%s rejects and keeps the current session',
        async (_name, operation, field, call) => {
          server.use(mockOperation(operation, { [field]: { token: returnedToken } }));
          const { client, userToken } = createSignedInClient();

          await expect(call(client)).rejects.toBe('Invalid user token');
          expect(client.getUserToken()).toBe(userToken);
          expect(Cookies.get(USER_TOKEN_COOKIE_KEY)).toBe(userToken);
        },
      );
    });
  });

  describe('signOut', () => {
    it('removes the user token from memory and the cookie', () => {
      const { client } = createSignedInClient();

      client.signOut();

      expect(client.getUserToken()).toBeNull();
      expect(Cookies.get(USER_TOKEN_COOKIE_KEY)).toBeUndefined();
    });
  });

  describe('password & verification', () => {
    it('changePassword sends both passwords with the user token and reports success', async () => {
      let captured: CapturedRequest | undefined;
      server.use(
        mockOperation(
          'ChangePasswordMutation',
          { setPasswordForAccount: { account: { email: 'ada@example.com' } } },
          info => {
            captured = info;
          },
        ),
      );
      const { client, userToken } = createSignedInClient();

      await expect(client.changePassword({ password: 'old', newPassword: 'new' })).resolves.toBe(
        true,
      );
      expect(captured?.authorization).toBe(`Bearer ${userToken}`);
      expect(captured?.variables.change_password_input).toEqual({
        password: 'old',
        new_password: 'new',
      });
    });

    it('requestUserVerification sends its own operation with the email', async () => {
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'RequestUserVerificationMutation',
          { requestCustomerVerificationLink: { is_successful: true } },
          info => {
            variables = info.variables;
          },
        ),
      );

      await expect(
        createTestClient().requestUserVerification({ email: 'ada@example.com' }),
      ).resolves.toBe(true);
      expect(variables?.request_user_verification_input).toEqual({ email: 'ada@example.com' });
    });
  });

  describe('query vs queryAccount', () => {
    it('sends the storefront token for query and the user token for queryAccount', async () => {
      const authorizations: (string | null)[] = [];
      server.use(
        mockOperation('Ping', { ping: { ok: true } }, info => {
          authorizations.push(info.authorization);
        }),
      );
      const { client, userToken } = createSignedInClient();

      await client.query('query Ping { ping { ok } }');
      await client.queryAccount('query Ping { ping { ok } }');

      expect(authorizations).toEqual([`Bearer ${STOREFRONT_TOKEN}`, `Bearer ${userToken}`]);
    });

    it('never falls back to the storefront token for queryAccount when signed out', async () => {
      let authorization: string | null | undefined;
      server.use(
        mockOperation('Ping', { ping: { ok: true } }, info => {
          authorization = info.authorization;
        }),
      );

      await createTestClient().queryAccount('query Ping { ping { ok } }');

      expect(authorization).not.toContain(STOREFRONT_TOKEN);
    });
  });
});
