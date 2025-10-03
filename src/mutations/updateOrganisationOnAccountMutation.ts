import { gql } from '@afosto/graphql-client';
import { CoreAccountFragment } from '../fragments/CoreAccountFragment';
import type { AdministrationInput, AddressingInput, PhoneNumberInput, RegistrationInput, Account } from '../types';

export interface UpdateOrganisationOnAccountInput {
  updateOrganisationOnAccountInput: {
    id: string;
    name: string;
    administration: AdministrationInput;
    addressing?: AddressingInput;
    phoneNumbers?: PhoneNumberInput[];
    registration?: RegistrationInput;
    cocNumber?: string;
  }
}

export interface UpdateOrganisationOnAccountResponse {
  updateOrganisationOnAccount: {
    account: Account;
  };
}


export const updateOrganisationOnAccountMutation = gql`
  ${CoreAccountFragment}
  mutation UpdateOrganisationOnAccountMutation(
    $update_organisation_on_account_input: UpdateOrganisationOnAccountInput!
  ) {
    updateOrganisationOnAccount(input: $update_organisation_on_account_input) {
      account {
        ...CoreAccountFragment
      }
    }
  }
`;
