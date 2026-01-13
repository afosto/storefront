import { gql } from '@afosto/graphql-client';

export interface CoreWishlistItemProductPriceVat {
  rate: number;
  countryCode: string;
}

export interface CoreWishlistItemProductPrice {
  amount: number;
  originalAmount: number;
  vat: CoreWishlistItemProductPriceVat[];
}

export interface CoreWishlistItemProductFilter {
  key: string;
  value: string;
}

export interface CoreWishlistItemProduct {
  label: string;
  sku: string;
  gtin: string[];
  mpn: string;
  brand: string;
  categories: string[];
  filters: CoreWishlistItemProductFilter;
  prices: CoreWishlistItemProductPrice[];
}

export interface CoreWishlistItem {
  product: CoreWishlistItemProduct;
  quantity: number;
  metaData: JSON;
  expiresAt: number;
}

export interface CoreWishlist {
  label: string;
  token: string;
  items: CoreWishlistItem[];
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
}

export const CoreWishlistFragment = gql`
  fragment CoreWishlistFragment on Wishlist {
    label
    token
    items {
      quantity
      expires_at
      meta_data
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
    }
    expires_at
    created_at
    updated_at
  }
`;
