import { describe, expect, it } from 'vitest';
import { parseJwt } from '../../src/utils/parseJwt';
import { base64UrlEncode as encode, makeUserJwt } from '../msw/fixtures/auth';

const withPayload = (payload: string): string => `${encode('{"alg":"HS256"}')}.${payload}.sig`;

describe('parseJwt', () => {
  it('decodes the payload of a JWT', () => {
    const token = makeUserJwt({ sub: 'CU_1', exp: 1893456000, given_name: 'Ada' });

    expect(parseJwt(token)).toEqual({ sub: 'CU_1', exp: 1893456000, given_name: 'Ada' });
  });

  it('decodes base64url characters (- and _) that plain base64 does not use', () => {
    // '>>>' and '???' encode to '-' and '_' in base64url ('+' and '/' in base64).
    const payload = { a: '>>>', b: '???' };
    const encoded = encode(JSON.stringify(payload));
    expect(encoded).toMatch(/[-_]/);

    expect(parseJwt(withPayload(encoded))).toEqual(payload);
  });

  it.each([
    ['no padding needed', { s: 'abc' }],
    ['one padding char missing', { s: 'ab' }],
    ['two padding chars missing', { s: 'a' }],
  ])('decodes a payload with %s', (_label, payload) => {
    expect(parseJwt(withPayload(encode(JSON.stringify(payload))))).toEqual(payload);
  });

  it('decodes multi-byte UTF-8 claims', () => {
    const payload = { name: 'Zoë Ångström', city: '東京', emoji: '🛒' };

    expect(parseJwt(withPayload(encode(JSON.stringify(payload))))).toEqual(payload);
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty string', ''],
    ['a token without dots', 'not-a-jwt'],
    ['a header-only token', `${encode('{"alg":"HS256"}')}.`],
    ['a payload that is not base64', withPayload('!!!')],
    ['a payload that is not JSON', withPayload(encode('not json'))],
    ['a string payload', withPayload(encode('"sub"'))],
    ['a number payload', withPayload(encode('42'))],
    ['a null payload', withPayload(encode('null'))],
    ['an array payload', withPayload(encode('[1,2]'))],
  ])('returns null (never throws) for %s', (_label, token) => {
    expect(parseJwt(token)).toBeNull();
  });
});
