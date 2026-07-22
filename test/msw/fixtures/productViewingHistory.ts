/**
 * Product viewing history response in `snake_case` (shape from
 * CoreProductViewingHistoryFragment). Converted to `camelCase` before it
 * reaches the SDK.
 */
export const productViewingHistorySnakeCase = {
  label: 'Product viewing history',
  token: 'PVH_00000000-0000-4000-8000-000000000001',
  created_at: 1700000000,
  updated_at: 1700000100,
  expires_at: 1702592000,
  items: [
    {
      product: {
        label: 'Test product',
        sku: 'SKU-1',
        gtin: ['1234567890123'],
        mpn: 'MPN-1',
        brand: 'Afosto',
        images: ['https://afosto.app/image.jpg'],
        categories: ['cat-1'],
        slug: 'test-product',
        filters: [{ key: 'color', value: 'red' }],
        prices: [{ amount: 2500, original_amount: 3000, vat: [{ rate: 21, country_code: 'NL' }] }],
      },
    },
  ],
};

export const recreatedProductViewingHistorySnakeCase = {
  ...productViewingHistorySnakeCase,
  token: 'PVH_00000000-0000-4000-8000-000000000002',
};

/** A GraphQL error signalling a history the server no longer knows. */
export const productViewingHistoryNotFoundError = {
  message: 'Product viewing history not found',
  extensions: { status: 404 },
};
