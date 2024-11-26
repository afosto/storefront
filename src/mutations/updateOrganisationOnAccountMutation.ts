import { gql } from '@afosto/graphql-client';
import { CoreAccountFragment } from '../fragments';

export const updateOrganisationOnAccountMutation = gql`
  ${CoreAccountFragment}
  mutation updateOrganisationOnAccountMutation(
    $update_organisation_on_acount_input: UpdateOrganisationOnAccountInput!
  ) {
    updateOrganisationOnAccount(input: $update_organisation_on_acount_input) {
      account {
        ...CoreAccountFragment
      }
    }
  }
`;
