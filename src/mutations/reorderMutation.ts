import { gql } from '@afosto/graphql-client';
import { CoreCartFragment, type CoreCart } from '../fragments/CoreCartFragment';

export interface ReorderInput {
  reorderInput: {
    orderId: string;
    cartId?: string;
  }
}

export interface ReorderResponse {
  reorder: {
    cart: CoreCart;
  };
}

export const reorderMutation = gql`
  ${CoreCartFragment}
  mutation Reorder($reorder_input: ReorderInput!) {
    reorder(input: $reorder_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;
