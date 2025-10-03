import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments/CoreCartFragment';
import type { Cart } from '../types';

export interface SetCountryCodeForCartInput {
  setCountryCodeForCartInput: {
    cartId: string;
    countryCode: string;
  }
}

export interface SetCountryCodeForCartResponse {
  setCountryCodeForCart: {
    cart: Cart;
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
