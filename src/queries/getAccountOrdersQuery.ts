import { gql } from '@afosto/graphql-client';
import type { PageInfo } from '../types';

export interface GetAccountOrdersParams {
  first?: number;
  after?: string;
}

export interface GetAccountOrdersResponseOrderItemDelivery {
  expectedAt: number;
  status: string;
  trackTraceCode: string;
  trackTraceUrl: string;
}

export interface GetAccountOrdersResponseOrderItem {
  sku: string;
  type: string;
  image: string;
  label: string;
  brand: string;
  mpn: string;
  gtin: string[];
  url: string;
  quantity: number;
  delivery: GetAccountOrdersResponseOrderItemDelivery;
}

export interface GetAccountOrdersResponseOrder {
  id: string;
  number: string;
  createdAt: number;
  updatedAt: number;
  items: GetAccountOrdersResponseOrderItem[];
}

export interface GetAccountOrdersResponse {
  account: {
    orders: {
      nodes: GetAccountOrdersResponseOrder[];
      pageInfo: PageInfo;
    };
  };
}


export const getAccountOrdersQuery = gql`
  query GetAccountOrders($first: Int, $after: String) {
    account {
      orders(first: $first, after: $after) {
        nodes {
          id
          number
          created_at
          updated_at
          items {
            sku
            type
            image
            label
            brand
            mpn
            gtin
            url
            quantity
            delivery {
              expected_at
              status
              track_trace_code
              track_trace_url
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`;
