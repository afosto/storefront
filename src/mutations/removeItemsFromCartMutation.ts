import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments';

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
