---
'@afosto/storefront': major
---

The package is now ESM only and needs Node 22 or later. `dist/index.mjs` is replaced by `dist/index.js`, and the `main` and `module` fields by an `exports` map. Node 22+ can still `require()` the package.

`jwt-decode` is no longer a dependency. A malformed user token cookie no longer throws when the client is created: the cookie is removed and the user is signed out.

`@afosto/graphql-client` is updated to `^3.0.0`.
