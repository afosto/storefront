import { gql } from '@afosto/graphql-client';

export interface CreateStockUpdateSubscriptionInput {
  createStockUpdateSubscriptionInput: {
    email: string;
    sku: string;
  }
}

export interface CreateStockUpdateSubscriptionResponseSubscriptionProductFilter {
  key: string;
  value: string;
}

export interface CreateStockUpdateSubscriptionResponseSubscriptionProduct {
  sku: string;
  label: string;
  gtin: string[];
  mpn: string;
  images: string[];
  filters: CreateStockUpdateSubscriptionResponseSubscriptionProductFilter[];
}

export interface CreateStockUpdateSubscriptionResponseSubscription {
  email: string;
  products: CreateStockUpdateSubscriptionResponseSubscriptionProduct[];
  expiresAt: number;
}

export interface CreateStockUpdateSubscriptionResponse {
  createStockUpdateSubscription: {
    subscription: CreateStockUpdateSubscriptionResponseSubscription;
  };
}

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
