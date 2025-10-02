import { gql } from '@afosto/graphql-client';
import { CoreCartFragment, type CoreCart } from '../fragments/CoreCartFragment';
import type { ContactInput, OrganisationInput } from '../types';

export interface CreateCartInputCustomer {
  contact?: ContactInput;
  contactId?: string;
  organisation?: OrganisationInput;
  organisationId?: string;
  projectId?: string;
  notes?: string;
  reference?: string;
  locale?: string;
}

export interface CreateCartInput {
  cartInput: {
    id?: string;
    customer?: CreateCartInputCustomer;
    coupons?: string[];
    countryCode?: string;
    currency?: string;
    sessionId?: string;
    successReturnUrl?: string;
    failureReturnUrl?: string;
  }
}

export interface CreateCartResponse {
  createCart: {
    cart: CoreCart;
  };
}

export const createCartMutation = gql`
  ${CoreCartFragment}
  mutation CreateCart($cart_input: CartInput!) {
    createCart(input: $cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;

