import { gql } from '@afosto/graphql-client';
import { CoreAccountFragment, type CoreAccount } from '../fragments/CoreAccountFragment';
import type { AdministrationInput, AddressingInput, PhoneNumberInput, RegistrationInput } from '../types';

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
    account: CoreAccount;
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
