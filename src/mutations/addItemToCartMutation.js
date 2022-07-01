import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments';

const addItemToCartMutation = gql`
  ${CoreCartFragment}
  mutation AddItemToCart($add_item_to_cart_input: AddItemToCartInput!) {
    addItemToCart(input: $add_item_to_cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;

export default addItemToCartMutation;

