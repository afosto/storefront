import { gql } from '@afosto/graphql-client';

export interface CoreWishlistItemProductPriceVat {
  rate: number;
  country_code: string;
}

export interface CoreWishlistItemProductPrice {
  amount: number;
  original_amount: number;
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
  quantity: number;
  product: CoreWishlistItemProduct;
}

export interface CoreWishlist {
  label: string;
  token: string;
  items: CoreWishlistItem[];
}

export const CoreWishlistFragment = gql`
  fragment CoreWishlistFragment on Wishlist {
    label
    token
    items {
      quantity
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
  }
`;
