import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment, type CoreRma } from '../fragments/CoreRmaFragment';
import type { AccountRmaStatus, PageInfo } from '../types';

export interface GetAccountRmasParamsFilters {
  status?: AccountRmaStatus;
}

export interface GetAccountRmasParams {
  first?: number;
  after?: string;
  filters?: GetAccountRmasParamsFilters;
}

export interface GetAccountRmasResponse {
  rmas: {
    nodes: CoreRma[];
    pageInfo: PageInfo;
  }
}

export const getAccountRmasQuery = gql`
  ${CoreRmaFragment}
  query GetAccountRmas($first: Int, $after: String, $filters: RmaFiltersInput!) {
    rmas(first: $first, after: $after, filters: $filters) {
      nodes {
        ...CoreRmaFragment
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
