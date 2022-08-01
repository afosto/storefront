import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments';

const addItemsToCartMutation = gql`
  ${CoreCartFragment}
  mutation AddItemsToCart($add_items_to_cart_input: AddItemsToCartInput!) {
    addItemsToCart(input: $add_items_to_cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;

export default addItemsToCartMutation;
