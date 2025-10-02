import { gql } from '@afosto/graphql-client';
import { CoreAccountFragment, type CoreAccount } from '../fragments/CoreAccountFragment';
import type { AddressInput, PhoneNumberInput } from '../types';

export interface UpdateAccountInformationInput {
  updateAccountInformationInput: {
    email?: string;
    givenName?: string;
    additionalName?: string;
    familyName?: string;
    billing?: AddressInput[];
    shipping?: AddressInput[];
    phoneNumbers?: PhoneNumberInput[];
  }
}

export interface UpdateAccountInformationResponse {
  updateAccount: {
    account: CoreAccount;
  };
}

export const updateAccountInformationMutation = gql`
  ${CoreAccountFragment}
  mutation UpdateAccountInformationMutation($update_account_information_input: UpdateAccountInput!) {
    updateAccount(input: $update_account_information_input) {
      account {
        ...CoreAccountFragment
      }
    }
  }
`;
