import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments/CoreCartFragment';
import type { Cart } from '../types';

export interface ReorderInput {
  reorderInput: {
    orderId: string;
    cartId?: string;
  }
}

export interface ReorderResponse {
  reorder: {
    cart: Cart;
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
