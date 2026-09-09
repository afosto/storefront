/**
 * Realistic cart response in `snake_case`, as the GraphQL API returns it. The
 * `@afosto/graphql-client` conversion layer turns this into `camelCase` before
 * it reaches the SDK, so tests assert on the `camelCase` counterparts (see
 * `cartCamelCase`). Shape derived from `src/fragments/CoreCartFragment.ts`.
 */
export const cartSnakeCase = {
  id: 'CA_00000000-0000-4000-8000-000000000001',
  created_at: 1700000000,
  updated_at: 1700000100,
  currency: 'EUR',
  is_including_vat: true,
  is_vat_shifted: false,
  subtotal: 5000,
  total: 6050,
  total_excluding_vat: 5000,
  adjustments: [],
  checkout: { url: 'https://afosto.app/checkout/CA_1' },
  coupons: [{ code: 'WELCOME10' }],
  customer: {
    country_code: 'NL',
    contact: null,
    organisation: null,
    project: null,
  },
  incentives: [],
  items: [
    {
      ids: ['CI_1'],
      brand: 'Afosto',
      image: 'https://afosto.app/image.jpg',
      url: 'https://afosto.app/product',
      gtin: '1234567890123',
      label: 'Test product',
      mpn: 'MPN-1',
      quantity: 2,
      sku: 'SKU-1',
      subtotal: 5000,
      total: 6050,
      adjustments: [],
      details: [
        {
          ids: ['CID_1'],
          meta_data: '{}',
          parent_id: 'CI_1',
          filters: [{ key: 'color', value: 'red' }],
          pricing: { amount: 2500, original_amount: 3000 },
        },
      ],
      vat: { amount: 1050, percentage: 21 },
    },
  ],
  fees: { payment: [], shipping: [] },
  delivery: { address: { country_code: 'NL' } },
  vat: [{ amount: 1050, percentage: 21 }],
};

/** A second cart, used to distinguish an auto-recreated cart from the first. */
export const recreatedCartSnakeCase = {
  ...cartSnakeCase,
  id: 'CA_00000000-0000-4000-8000-000000000002',
};

/** A GraphQL error signalling a cart the server no longer knows. */
export const cartNotFoundError = {
  message: 'Cart not found',
  extensions: { status: 404 },
};
