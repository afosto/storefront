import { gql } from '@afosto/graphql-client';

export const approveStockUpdateSubscriptionMutation = gql`
  mutation ApproveStockUpdateSubscriptionMutation($approve_stock_update_subscription_input: ApproveStockUpdateSubscriptionInput!) {
    approveStockUpdateSubscription(input: $approve_stock_update_subscription_input) {
      is_successful
    }
  }
`;
