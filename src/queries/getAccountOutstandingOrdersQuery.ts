import { gql } from '@afosto/graphql-client';
import {
  CoreAccountListedOrderFragment,
  type CoreAccountListedOrder,
} from '../fragments/CoreAccountListedOrderFragment';

export interface GetAccountOutstandingOrdersResponse {
  account: {
    outstandingOrders: CoreAccountListedOrder[];
  };
}

export const getAccountOutstandingOrdersQuery = gql`
  ${CoreAccountListedOrderFragment}
  query GetAccountOutstandingOrders {
    account {
      outstanding_orders {
        ...CoreAccountListedOrderFragment
      }
    }
  }
`;
