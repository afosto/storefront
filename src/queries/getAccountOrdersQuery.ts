import { gql } from '@afosto/graphql-client';

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
