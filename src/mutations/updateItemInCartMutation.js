import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments';

const updateItemInCartMutation = gql`
  ${CoreCartFragment}
  mutation UpdateItemInCart($update_item_in_cart_input: UpdateItemInCartInput!) {
    updateItemInCart(input: $update_item_in_cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;

export default updateItemInCartMutation;
