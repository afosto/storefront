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

export interface SearchAccountRmaItemsResponseRmaItemFilter {
  key: string;
  value: string;
}

export interface SearchAccountRmaItemsResponseRmaItemProduct {
  sku: string;
  label: string;
  brand: string;
  gtin: string[];
  images: string[];
  mpn: string;
  filters: SearchAccountRmaItemsResponseRmaItemFilter[];
}

export interface SearchAccountRmaItemsResponseRmaItemOrder {
  id: string;
  number: string;
  currency: string;
}

export interface SearchAccountRmaItemsResponseRmaItem {
  id: string;
  product: SearchAccountRmaItemsResponseRmaItemProduct;
  image: string;
  status: AccountSearchRmaItemStatus;
  order: SearchAccountRmaItemsResponseRmaItemOrder;
  url: string;
  warrantyExpiresAt: number;
  withdrawalExpiresAt: number;
  createdAt: number;
}

export interface SearchAccountRmaItemsResponse {
  searchRmaItems: {
    nodes: SearchAccountRmaItemsResponseRmaItem[];
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
