import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments/CoreCartFragment';
import type { Cart } from '../types';

export interface RemoveItemsFromCartInput {
  removeItemsFromCartInput: {
    cartId: string;
    ids: string[];
  }
}

export interface RemoveItemsFromCartResponse {
  removeItemsFromCart: {
    cart: Cart;
  };
}

export const removeItemsFromCartMutation = gql`
  ${CoreCartFragment}
  mutation RemoveItemsFromCart($remove_items_from_cart_input: RemoveItemFromCartInput!) {
    removeItemsFromCart(input: $remove_items_from_cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;
