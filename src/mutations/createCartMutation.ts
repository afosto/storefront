import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments/index.js';

const createCartMutation = gql`
  ${CoreCartFragment}
  mutation CreateCart($cart_input: CartInput!) {
    createCart(input: $cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;

export default createCartMutation;

