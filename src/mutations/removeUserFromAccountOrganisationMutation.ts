import { gql } from '@afosto/graphql-client';
import { CorePhoneNumberFragment } from '../fragments';

export const removeUserFromAccountOrganisationMutation = gql`
  ${CorePhoneNumberFragment}
  mutation RemoveUserFromAccountOrganisation(
    $remove_user_from_account_organisation_input: RemoveContactFromAccountOrganisationInput!
  ) {
    removeContactFromAccountOrganisation(input: $remove_user_from_account_organisation_input) {
      organisation {
        id
        type
        shared_contacts {
          is_admin
          contact {
            id
            number
            email
            given_name
            additional_name
            family_name
            phone_numbers {
              primary {
                ...CorePhoneNumberFragment
              }
            }
          }
        }
      }
    }
  }
`;
