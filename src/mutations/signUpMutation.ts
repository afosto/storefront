import { gql } from '@afosto/graphql-client';
import type { AddressingInput, PhoneNumberInput } from '../types';

export interface SignUpInput {
  signUpInput: {
    email: string;
    password: string;
    givenName: string;
    additionalName?: string;
    familyName: string;
    addressing?: AddressingInput;
    phoneNumber?: PhoneNumberInput;
  }
}

export interface SignUpResponse {
  registerCustomer: {
    token: string;
    expiresAt: number;
  };
}

export const signUpMutation = gql`
  mutation SignUpMutation($sign_up_input: RegisterCustomerInput!) {
    registerCustomer(input: $sign_up_input) {
      token
      expires_at
    }
  }
`;
