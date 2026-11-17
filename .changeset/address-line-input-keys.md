---
'@afosto/storefront': patch
---

Send the address lines under the names the schema uses. `addressLine1`, `addressLine2` and
`addressLine3` left the client as `address_line1`, `address_line2` and `address_line3`, so Afosto
refused every request that carried an address with `unknown field address_line1`. They are now sent
as `address_line_1`, `address_line_2` and `address_line_3`, the same names the API returns them
under. The names you write stay the same, and `addressLine3` is now part of `AddressInput`.
