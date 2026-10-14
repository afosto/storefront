const base64Url = (value: object): string =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/**
 * Build a signed-looking JWT for tests. The client only ever decodes the
 * payload (via `parseJwt`) and never verifies the signature, so a static
 * signature segment is enough.
 */
export const makeUserJwt = (payload: Record<string, unknown>): string =>
  `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.signature`;

/** Seconds since epoch, one hour in the future. */
export const oneHourFromNow = () => Math.floor(Date.now() / 1000) + 3600;

/** Seconds since epoch, one hour in the past. */
export const oneHourAgo = () => Math.floor(Date.now() / 1000) - 3600;

/** A valid, non-expired user token carrying the claims getUser() maps. */
export const validUserToken = () =>
  makeUserJwt({
    sub: 'CU_00000000-0000-4000-8000-000000000001',
    exp: oneHourFromNow(),
    email: 'ada@example.com',
    given_name: 'Ada',
    family_name: 'Lovelace',
    name: 'Ada Lovelace',
    organisation_id: 'OR_1',
    organisation_name: 'Analytical Engines',
    contact_role: 'ADMIN',
  });

/** An expired user token (valid claims, but `exp` in the past). */
export const expiredUserToken = () =>
  makeUserJwt({
    sub: 'CU_00000000-0000-4000-8000-000000000001',
    exp: oneHourAgo(),
    email: 'ada@example.com',
  });

/** A token missing `sub`, which validateUserToken rejects. */
export const tokenWithoutSub = () => makeUserJwt({ exp: oneHourFromNow() });
