import { gql } from '@afosto/graphql-client';
import { CoreOrderFragment, type CoreOrder } from '../fragments/CoreOrderFragment';

export interface GetOrderParams {
  id: string;
}

export interface GetOrderResponse {
  order: CoreOrder;
}

export const getOrderQuery = gql`
  ${CoreOrderFragment}
  query GetOrder($id: String!) {
    order(id: $id) {
      ...CoreOrderFragment
    }
  }
`;
