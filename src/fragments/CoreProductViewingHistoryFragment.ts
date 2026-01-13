import { gql } from '@afosto/graphql-client';

export interface CoreProductViewingHistoryItemProductPriceVat {
  rate: number;
  countryCode: string;
}

export interface CoreProductViewingHistoryItemProductPrice {
  amount: number;
  originalAmount: number;
  vat: CoreProductViewingHistoryItemProductPriceVat[];
}

export interface CoreProductViewingHistoryItemProductFilter {
  key: string;
  value: string;
}

export interface CoreProductViewingHistoryItemProduct {
  label: string;
  sku: string;
  gtin: string[];
  mpn: string;
  brand: string;
  categories: string[];
  filters: CoreProductViewingHistoryItemProductFilter;
  prices: CoreProductViewingHistoryItemProductPrice[];
}

export interface CoreProductViewingHistoryItem {
  product: CoreProductViewingHistoryItemProduct;
  expiresAt: number;
  viewedAt: number;
}

export interface CoreProductViewingHistory {
  label: string;
  token: string;
  items: CoreProductViewingHistoryItem[];
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
}

export const CoreProductViewingHistoryFragment = gql`
  fragment CoreProductViewingHistoryFragment on ProductViewingHistory {
    label
    token
    items {
      product {
        label
        sku
        gtin
        mpn
        brand
        images
        categories
        slug
        filters {
          key
          value
        }
        prices {
          amount
          original_amount
          vat {
            rate
            country_code
          }
        }
      }
      meta_data
      viewed_at
      expires_at
    }
    expires_at
    created_at
    updated_at
  }
`;
