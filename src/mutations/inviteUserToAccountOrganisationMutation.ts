import { gql } from '@afosto/graphql-client';
import { CoreSharedContactFragment, type CoreSharedContact } from '../fragments/CoreSharedContactFragment';
import type { OrganisationType } from '../types';

export interface InviteUserToAccountOrganisationInputContact {
  contactId?: string;
  email?: string;
  role: string;
}

export interface InviteUserToAccountOrganisationInput {
  inviteUserToAccountOrganisationInput: {
    organisationId: string;
    contact: InviteUserToAccountOrganisationInputContact;
  }
}

export interface InviteUserToAccountOrganisationResponseOrganisation {
  id: string;
  type: OrganisationType;
  sharedContacts: CoreSharedContact[];
}

export interface InviteUserToAccountOrganisationResponse {
  addContactToAccountOrganisation: {
    organisation: InviteUserToAccountOrganisationResponseOrganisation;
  };
}

export const inviteUserToAccountOrganisationMutation = gql`
  ${CoreSharedContactFragment}
  mutation InviteUserToAccountOrganisation(
    $invite_user_to_account_organisation_input: AddContactToAccountOrganisationInput!
  ) {
    addContactToAccountOrganisation(input: $invite_user_to_account_organisation_input) {
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
