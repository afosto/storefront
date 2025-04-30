import { gql } from '@afosto/graphql-client';

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
