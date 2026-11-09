# @afosto/storefront

## 5.0.0

### Major Changes

- [#98](https://github.com/afosto/storefront/pull/98) [`d9d88e7`](https://github.com/afosto/storefront/commit/d9d88e747c2dd383ad9f8d223fb3248faed63c07) Thanks [@afosto-portal](https://github.com/apps/afosto-portal)! - The package is now ESM only and needs Node 22 or later. `dist/index.mjs` is replaced by `dist/index.js`, and the `main` and `module` fields by an `exports` map. Node 22+ can still `require()` the package.
  
  `jwt-decode` is no longer a dependency. A malformed user token cookie no longer throws when the client is created: the cookie is removed and the user is signed out.
  
  `@afosto/graphql-client` is updated to `^3.0.0`.
