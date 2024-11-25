import { gql } from '@afosto/graphql-client';
import { CoreOrganisationFragment } from '../fragments';

export const inviteUserToAccountOrganisationMutation = gql`
  ${CoreOrganisationFragment}
  mutation InviteUserToAccountOrganisation(
    $invite_user_to_account_organisation_input: AddContactToAccountOrganisationInput!
  ) {
    addContactToAccountOrganisation(input: $invite_user_to_account_organisation_input) {
      organisation {
        id
        ...CoreOrganisationFragment
      }
    }
  }
`;
