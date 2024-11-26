import { gql } from '@afosto/graphql-client';
import { CoreAccountFragment } from '../fragments';

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
