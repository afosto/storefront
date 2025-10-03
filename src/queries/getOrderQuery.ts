import { gql } from '@afosto/graphql-client';
import { CoreOrderFragment } from '../fragments/CoreOrderFragment';
import type { Order } from '../types';

export interface GetOrderParams {
  id: string;
}

export interface GetOrderResponse {
  order: Order;
}

export const getOrderQuery = gql`
  ${CoreOrderFragment}
  query GetOrder($id: String!) {
    order(id: $id) {
      ...CoreOrderFragment
    }
  }
`;
