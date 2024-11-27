import { gql } from '@afosto/graphql-client';
import { CorePhoneNumberFragment } from '../fragments';

export const updateContactRoleInOrganisationMutation = gql`
  ${CorePhoneNumberFragment}
  mutation UpdateAccountInformationMutation(
    $update_contact_role_in_organisation_input: UpdateContactRoleInOrganisationInput!
  ) {
    updateContactRoleInOrganisation(input: $update_contact_role_in_organisation_input) {
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
