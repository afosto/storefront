import { gql } from '@afosto/graphql-client';
import type { AccountSearchRmaItemStatus, PageInfo } from '../types';

export interface SearchAccountRmaItemsParamsFilters {
  contactId?: string;
  organisationId?: string;
  orderId?: string;
  projectId?: string;
  sku?: string;
  warrantyExpiresAt?: number;
  withdrawalExpiresAt?: number;
}

export interface SearchAccountRmaItemsParams {
  first?: number;
  after?: string;
  filters?: SearchAccountRmaItemsParamsFilters;
}

export interface SearchAccountRmaItemFilter {
  key: string;
  value: string;
}

export interface SearchAccountRmaItemProduct {
  sku: string;
  label: string;
  brand: string;
  gtin: string[];
  images: string[];
  mpn: string;
  filters: SearchAccountRmaItemFilter[];
}

export interface SearchAccountRmaItemOrder {
  id: string;
  number: string;
  currency: string;
}

export interface SearchAccountRmaItem {
  id: string;
  product: SearchAccountRmaItemProduct;
  image: string;
  status: AccountSearchRmaItemStatus;
  order: SearchAccountRmaItemOrder;
  url: string;
  warrantyExpiresAt: number;
  withdrawalExpiresAt: number;
  createdAt: number;
}

export interface SearchAccountRmaItemsResponse {
  searchRmaItems: {
    nodes: SearchAccountRmaItem[];
    pageInfo: PageInfo;
  };
}

export const searchAccountRmaItemsQuery = gql`
  query SearchAccountRmaItems($first: Int, $after: String, $filters: RmaItemFiltersInput!) {
    searchRmaItems(first: $first, after: $after, filters: $filters) {
      nodes {
        id
        product {
          sku
          label
          brand
          gtin
          images
          mpn
          filters {
            key
            value
          }
        }
        image
        status
        order {
          id
          number
          currency
        }
        url
        created_at
        warranty_expires_at
        withdrawal_expires_at
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;
