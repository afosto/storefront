import { gql } from '@afosto/graphql-client';

export interface ApproveStockUpdateSubscriptionInput {
  approveStockUpdateSubscriptionInput: {
    token: string;
  };
}

export interface ApproveStockUpdateSubscriptionResponse {
  approveStockUpdateSubscription: {
    isSuccessful: boolean;
  }
}

export const approveStockUpdateSubscriptionMutation = gql`
  mutation ApproveStockUpdateSubscriptionMutation($approve_stock_update_subscription_input: ApproveStockUpdateSubscriptionInput!) {
    approveStockUpdateSubscription(input: $approve_stock_update_subscription_input) {
      is_successful
    }
  }
`;
