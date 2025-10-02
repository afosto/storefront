import { gql } from '@afosto/graphql-client';

export interface RemoveStockUpdateSubscriptionInput {
  removeStockUpdateSubscriptionInput: {
    token: string;
  }
}

export interface RemoveStockUpdateSubscriptionResponse {
  removeStockUpdateSubscription: {
    isSuccessful: boolean;
  };
}

export const removeStockUpdateSubscriptionMutation = gql`
  mutation RemoveStockUpdateSubscriptionMutation($remove_stock_update_subscription_input: RemoveStockUpdateSubscriptionInput!) {
    removeStockUpdateSubscription(input: $remove_stock_update_subscription_input) {
      is_successful
    }
  }
`;
