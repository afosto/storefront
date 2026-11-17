# @afosto/storefront

## 5.1.1

### Patch Changes

- [#104](https://github.com/afosto/storefront/pull/104) [`ddb3ed0`](https://github.com/afosto/storefront/commit/ddb3ed08184e6add090e1b9e27059fa3ac88deba) Thanks [@afosto-portal](https://github.com/apps/afosto-portal)! - Send the address lines under the names the schema uses. `addressLine1`, `addressLine2` and
  `addressLine3` left the client as `address_line1`, `address_line2` and `address_line3`, so Afosto
  refused every request that carried an address with `unknown field address_line1`. They are now sent
  as `address_line_1`, `address_line_2` and `address_line_3`, the same names the API returns them
  under. The names you write stay the same, and `addressLine3` is now part of `AddressInput`.

## 5.1.0

### Minor Changes

- [#102](https://github.com/afosto/storefront/pull/102) [`33d4cde`](https://github.com/afosto/storefront/commit/33d4cde413e5754c65de41a880f59f5fb4e0319f) Thanks [@afosto-portal](https://github.com/apps/afosto-portal)! - Add `requestBusinessAccount`, which registers a user together with an account request for the
  organisation it orders for. The user is signed in right away, but the organisation can only be used
  once an administrator approves the request in Afosto.

## 5.0.1

### Patch Changes

- [#100](https://github.com/afosto/storefront/pull/100) [`c874e0b`](https://github.com/afosto/storefront/commit/c874e0b469eee6c3eec4bff17194c2a2017efb59) Thanks [@afosto-portal](https://github.com/apps/afosto-portal)! - Restore the types of the cookie options (`cartTokenCookieOptions` and the others). Since 5.0.0 they resolved to `any`, or failed to compile with `skipLibCheck` off, because `@types/js-cookie` was no longer installed with the package.

- [#100](https://github.com/afosto/storefront/pull/100) [`b3efbcc`](https://github.com/afosto/storefront/commit/b3efbcc028ddaf524bea2cd820889a142cc8e072) Thanks [@afosto-portal](https://github.com/apps/afosto-portal)! - Internal: the client is split per domain and the cart, wishlist and product viewing history tokens share one token store. The public API and behaviour are unchanged.

## 5.0.0

### Major Changes

- [#98](https://github.com/afosto/storefront/pull/98) [`d9d88e7`](https://github.com/afosto/storefront/commit/d9d88e747c2dd383ad9f8d223fb3248faed63c07) Thanks [@afosto-portal](https://github.com/apps/afosto-portal)! - The package is now ESM only and needs Node 22 or later. `dist/index.mjs` is replaced by `dist/index.js`, and the `main` and `module` fields by an `exports` map. Node 22+ can still `require()` the package.
  
  `jwt-decode` is no longer a dependency. A malformed user token cookie no longer throws when the client is created: the cookie is removed and the user is signed out.
  
  `@afosto/graphql-client` is updated to `^3.0.0`.
