import { gql } from '@afosto/graphql-client';
import { CorePhoneNumberFragment } from '../fragments';

export const inviteUserToAccountOrganisationMutation = gql`
  ${CorePhoneNumberFragment}
  mutation InviteUserToAccountOrganisation(
    $invite_user_to_account_organisation_input: AddContactToAccountOrganisationInput!
  ) {
    addContactToAccountOrganisation(input: $invite_user_to_account_organisation_input) {
      organisation {
        id
        type
        shared_contacts {
          role
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
