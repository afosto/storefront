import { gql } from '@afosto/graphql-client';
import { CoreCartFragment, type CoreCart } from '../fragments/CoreCartFragment';

export interface RemoveItemsFromCartInput {
  removeItemsFromCartInput: {
    cartId: string;
    ids: string[];
  }
}

export interface RemoveItemsFromCartResponse {
  removeItemsFromCart: {
    cart: CoreCart;
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
