import { gql } from '@afosto/graphql-client';
import { CoreSharedContactFragment, type CoreSharedContact } from '../fragments/CoreSharedContactFragment';
import type { OrganisationType } from '../types';

export interface UpdateContactRoleInOrganisationInput {
  updateContactRoleInOrganisationInput: {
    organisationId: string;
    contactId: string;
    role: string;
  }
}

export interface UpdateContactRoleInOrganisationResponseOrganisation {
  id: string;
  type: OrganisationType;
  sharedContacts: CoreSharedContact[];
}

export interface UpdateContactRoleInOrganisationResponse {
  updateContactRoleInOrganisation: {
    organisation: UpdateContactRoleInOrganisationResponseOrganisation;
  };
}

export const updateContactRoleInOrganisationMutation = gql`
  ${CoreSharedContactFragment}
  mutation UpdateContactRoleInOrganisationMutation(
    $update_contact_role_in_organisation_input: UpdateContactRoleInOrganisationInput!
  ) {
    updateContactRoleInOrganisation(input: $update_contact_role_in_organisation_input) {
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
