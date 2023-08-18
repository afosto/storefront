import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments/index.js';

const setCountryCodeForCartMutation = gql`
  ${CoreCartFragment}
  mutation setCountryCodeForCart($set_country_code_for_cart_input: SetCountryCodeForCartInput!) {
    setCountryCodeForCart(input: $set_country_code_for_cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;

export default setCountryCodeForCartMutation;
