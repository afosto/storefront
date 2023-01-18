import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments';

const setCountryCodeOnCartMutation = gql`
  ${CoreCartFragment}
  mutation SetCountryCodeOnCart($set_country_code_on_cart_input: SetCountryCodeOnCartInput!) {
    setCountryCodeOnCart(input: $set_country_code_on_cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;

export default setCountryCodeOnCartMutation;
