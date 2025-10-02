import { gql } from '@afosto/graphql-client';
import { CoreSharedContactFragment, type CoreSharedContact } from '../fragments/CoreSharedContactFragment';
import type { OrganisationType } from '../types';

export interface RemoveUserFromAccountOrganisationInput {
  removeUserFromAccountOrganisationInput: {
    organisationId: string;
    contactId: string;
  }
}

export interface RemoveUserFromAccountOrganisationResponseOrganisation {
  id: string;
  type: OrganisationType;
  sharedContacts: CoreSharedContact[];
}

export interface RemoveUserFromAccountOrganisationResponse {
  removeContactFromAccountOrganisation: {
    organisation: RemoveUserFromAccountOrganisationResponseOrganisation;
  };
}

export const removeUserFromAccountOrganisationMutation = gql`
  ${CoreSharedContactFragment}
  mutation RemoveUserFromAccountOrganisation(
    $remove_user_from_account_organisation_input: RemoveContactFromAccountOrganisationInput!
  ) {
    removeContactFromAccountOrganisation(input: $remove_user_from_account_organisation_input) {
      organisation {
        id
        type
        shared_contacts {
          ...CoreSharedContactFragment
        }
      }
    }
  }
`;
