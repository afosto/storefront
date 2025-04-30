import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments';

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
