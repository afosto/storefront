import { describe, expect, it } from 'vitest';
import Cookies from 'js-cookie';
import { server } from '../msw/server';
import { mockOperation } from '../msw/graphql';
import {
  expiredUserToken,
  makeUserJwt,
  oneHourFromNow,
  tokenWithoutSub,
  validUserToken,
} from '../msw/fixtures/auth';
import { STOREFRONT_TOKEN, USER_TOKEN_COOKIE_KEY, createTestClient } from './helpers';

/**
 * Auth / user-token domain. Session validity is decided fully client-side from
 * the JWT (`exp` + `sub`); there is no server-side 401/403 path. The user token
 * always lives in the `af-sid` cookie, independent of storageType.
 */
describe('auth / user token domain', () => {
  const seedUserCookie = (token: string) => Cookies.set(USER_TOKEN_COOKIE_KEY, token);

  describe('validateUserToken', () => {
    it('accepts a token with a future exp and a sub', () => {
      const client = createTestClient();
      expect(client.validateUserToken(validUserToken())).toBeTruthy();
    });

    it('rejects an expired token', () => {
      const client = createTestClient();
      expect(client.validateUserToken(expiredUserToken())).toBeFalsy();
    });

    it('rejects a token without a sub', () => {
      const client = createTestClient();
      expect(client.validateUserToken(tokenWithoutSub())).toBeFalsy();
    });

    it('rejects a token without an exp', () => {
      const client = createTestClient();
      expect(client.validateUserToken(makeUserJwt({ sub: 'CU_1' }))).toBeFalsy();
    });

    it('rejects an empty token (nothing to decode)', () => {
      const client = createTestClient();
      expect(client.validateUserToken('')).toBeFalsy();
    });
  });

  describe('initializeUserToken (on client creation)', () => {
    it('keeps a valid token found in the cookie', () => {
      seedUserCookie(validUserToken());
      const client = createTestClient();
      expect(client.getUserToken()).toBeTruthy();
      expect(client.getUser()?.id).toBe('CU_00000000-0000-4000-8000-000000000001');
    });

    it('removes an expired token from the cookie', () => {
      seedUserCookie(expiredUserToken());
      const client = createTestClient();
      expect(client.getUserToken()).toBeNull();
      expect(Cookies.get(USER_TOKEN_COOKIE_KEY)).toBeUndefined();
    });

    it('does not read the token when storeUserToken is disabled', () => {
      seedUserCookie(validUserToken());
      const client = createTestClient({ storeUserToken: false });
      expect(client.getUserToken()).toBeNull();
    });
  });

  describe('getUser', () => {
    it('maps the JWT claims (which bypass the camelCase conversion)', () => {
      seedUserCookie(validUserToken());
      const client = createTestClient();

      expect(client.getUser()).toEqual({
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

    it('returns null when there is no user token', () => {
      const client = createTestClient();
      expect(client.getUser()).toBeNull();
    });
  });

  describe('signIn', () => {
    it('stores the returned token and returns the user', async () => {
      const token = validUserToken();
      let captured: Request | undefined;
      server.use(
        mockOperation('SignInMutation', { logInCustomer: { token } }, info => {
          captured = info.request;
        }),
      );

      const client = createTestClient();
      const user = await client.signIn({ email: 'ada@example.com', password: 'secret' });

      expect(user?.email).toBe('ada@example.com');
      expect(client.getUserToken()).toBe(token);
      // signIn is a public (storefront-token) request.
      expect(captured?.headers.get('authorization')).toBe(`Bearer ${STOREFRONT_TOKEN}`);
    });

    it('rejects and stores nothing when the returned token is invalid', async () => {
      server.use(mockOperation('SignInMutation', { logInCustomer: { token: expiredUserToken() } }));

      const client = createTestClient();
      await expect(
        client.signIn({ email: 'ada@example.com', password: 'secret' }),
      ).rejects.toBe('Invalid user token');
      expect(client.getUserToken()).toBeNull();
    });
  });

  describe('signUp', () => {
    it('stores the returned token and returns the user', async () => {
      const token = validUserToken();
      server.use(mockOperation('SignUpMutation', { registerCustomer: { token } }));

      const client = createTestClient();
      const user = await client.signUp({
        givenName: 'Ada',
        familyName: 'Lovelace',
        email: 'ada@example.com',
        password: 'secret',
      });

      expect(user?.givenName).toBe('Ada');
      expect(client.getUserToken()).toBe(token);
    });

    it('rejects when the returned token is invalid', async () => {
      server.use(mockOperation('SignUpMutation', { registerCustomer: { token: expiredUserToken() } }));

      const client = createTestClient();
      await expect(
        client.signUp({ givenName: 'Ada', familyName: 'Lovelace', email: 'ada@example.com', password: 'secret' }),
      ).rejects.toBe('Invalid user token');
    });
  });

  describe('signOut', () => {
    it('removes the user token from memory and the cookie', () => {
      seedUserCookie(validUserToken());
      const client = createTestClient();
      expect(client.getUserToken()).toBeTruthy();

      client.signOut();

      expect(client.getUserToken()).toBeNull();
      expect(Cookies.get(USER_TOKEN_COOKIE_KEY)).toBeUndefined();
    });
  });

  describe('queryAccount vs query (Authorization header)', () => {
    it('sends the user token for queryAccount and the storefront token for query', async () => {
      const token = makeUserJwt({ sub: 'CU_1', exp: oneHourFromNow() });
      seedUserCookie(token);
      const headers: Record<string, string | null> = {};
      server.use(
        mockOperation('Ping', { ping: { ok: true } }, info => {
          // Distinguish the two calls by which token the header carries.
          const auth = info.request.headers.get('authorization');
          headers[auth === `Bearer ${token}` ? 'account' : 'storefront'] = auth;
        }),
      );

      const client = createTestClient();
      await client.query('query Ping { ping { ok } }');
      await client.queryAccount('query Ping { ping { ok } }');

      expect(headers.storefront).toBe(`Bearer ${STOREFRONT_TOKEN}`);
      expect(headers.account).toBe(`Bearer ${token}`);
    });
  });
});
