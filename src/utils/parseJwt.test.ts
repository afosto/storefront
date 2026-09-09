import { describe, expect, it } from 'vitest';
import { parseJwt } from './parseJwt';

const base64Url = (value: object): string =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const makeJwt = (payload: object): string =>
  `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.signature`;

describe('parseJwt', () => {
  it('decodes the payload of a valid JWT', () => {
    const token = makeJwt({ sub: 'user-1', exp: 1893456000, given_name: 'Ada' });

    expect(parseJwt(token)).toEqual({
      sub: 'user-1',
      exp: 1893456000,
      given_name: 'Ada',
    });
  });

  it('returns null when no token is given', () => {
    expect(parseJwt()).toBeNull();
    expect(parseJwt(undefined)).toBeNull();
    expect(parseJwt('')).toBeNull();
  });

  it('throws on a malformed token', () => {
    expect(() => parseJwt('not-a-valid-jwt')).toThrow();
  });
});
