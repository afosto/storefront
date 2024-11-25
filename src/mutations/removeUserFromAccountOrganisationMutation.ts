import { gql } from '@afosto/graphql-client';
import { CoreOrganisationFragment } from '../fragments';

export const removeUserFromAccountOrganisationMutation = gql`
  ${CoreOrganisationFragment}
  mutation RemoveUserFromAccountOrganisation(
    $remove_user_from_account_organisation_input: RemoveContactFromAccountOrganisationInput!
  ) {
    removeContactFromAccountOrganisation(input: $remove_user_from_account_organisation_input) {
      organisation {
        id
        ...CoreOrganisationFragment
      }
    }
  }
`;
