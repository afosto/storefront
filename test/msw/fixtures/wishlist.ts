/**
 * Wishlist response in `snake_case` (shape from CoreWishlistFragment). The
 * conversion layer turns this into `camelCase` before it reaches the SDK.
 */
export const wishlistSnakeCase = {
  label: 'Wishlist',
  token: 'WL_00000000-0000-4000-8000-000000000001',
  created_at: 1700000000,
  updated_at: 1700000100,
  expires_at: 1702592000,
  items: [
    {
      quantity: 1,
      expires_at: 1702592000,
      meta_data: '{}',
      product: {
        label: 'Test product',
        sku: 'SKU-1',
        gtin: ['1234567890123'],
        mpn: 'MPN-1',
        brand: 'Afosto',
        images: ['https://afosto.app/image.jpg'],
        categories: ['cat-1'],
        filters: [{ key: 'color', value: 'red' }],
        prices: [{ amount: 2500, original_amount: 3000, vat: [{ rate: 21, country_code: 'NL' }] }],
      },
    },
  ],
};

export const recreatedWishlistSnakeCase = {
  ...wishlistSnakeCase,
  token: 'WL_00000000-0000-4000-8000-000000000002',
};

/** A GraphQL error signalling a wishlist the server no longer knows. */
export const wishlistNotFoundError = {
  message: 'Wishlist not found',
  extensions: { status: 404 },
};
