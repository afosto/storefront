import { gql } from '@afosto/graphql-client';

export const createStockUpdateSubscriptionMutation = gql`
  mutation CreateStockUpdateSubscriptionMutation(
    $create_stock_update_subscription_input: CreateStockUpdateSubscriptionInput!
  ) {
    createStockUpdateSubscription(input: $create_stock_update_subscription_input) {
      subscription {
        email
        products {
          sku
          label
          gtin
          mpn
          images
          filters {
            key
            value
          }
        }
        expires_at
      }
    }
  }
`;
