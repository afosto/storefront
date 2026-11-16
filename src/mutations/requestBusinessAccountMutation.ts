import { gql } from '@afosto/graphql-client';
import type { BusinessAccountOrganisationInput, PhoneNumberInput } from '../types';

export interface RequestBusinessAccountInput {
  requestBusinessAccountInput: {
    givenName: string;
    additionalName?: string;
    familyName: string;
    email: string;
    password: string;
    phoneNumber?: PhoneNumberInput;
    organisation: BusinessAccountOrganisationInput;
  };
}

export interface RequestBusinessAccountResponse {
  requestBusinessAccount: {
    token: string;
    expiresAt: number;
  };
}

export const requestBusinessAccountMutation = gql`
  mutation RequestBusinessAccountMutation(
    $request_business_account_input: RequestBusinessAccountInput!
  ) {
    requestBusinessAccount(input: $request_business_account_input) {
      token
      expires_at
    }
  }
`;
