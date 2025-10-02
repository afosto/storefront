import { gql } from '@afosto/graphql-client';
import { CoreCartFragment, type CoreCart } from '../fragments/CoreCartFragment';

export interface SetCountryCodeForCartInput {
  setCountryCodeForCartInput: {
    cartId: string;
    countryCode: string;
  }
}

export interface SetCountryCodeForCartResponse {
  setCountryCodeForCart: {
    cart: CoreCart;
  };
}

export const setCountryCodeForCartMutation = gql`
  ${CoreCartFragment}
  mutation setCountryCodeForCart($set_country_code_for_cart_input: SetCountryCodeForCartInput!) {
    setCountryCodeForCart(input: $set_country_code_for_cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;
