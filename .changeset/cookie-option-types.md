---
'@afosto/storefront': patch
---

Restore the types of the cookie options (`cartTokenCookieOptions` and the others). Since 5.0.0 they resolved to `any`, or failed to compile with `skipLibCheck` off, because `@types/js-cookie` was no longer installed with the package.
