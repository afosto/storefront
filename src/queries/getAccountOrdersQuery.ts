import { gql } from '@afosto/graphql-client';
import type { PageInfo } from '../types';
import {
  CoreAccountListedOrderFragment,
  type CoreAccountListedOrder,
} from '../fragments/CoreAccountListedOrderFragment';

export interface GetAccountOrdersParams {
  first?: number;
  after?: string;
}

export interface GetAccountOrdersResponse {
  account: {
    orders: {
      nodes: CoreAccountListedOrder[];
      pageInfo: PageInfo;
    };
  };
}

export const getAccountOrdersQuery = gql`
  ${CoreAccountListedOrderFragment}
  query GetAccountOrders($first: Int, $after: String) {
    account {
      orders(first: $first, after: $after) {
        nodes {
          ...CoreAccountListedOrderFragment
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
