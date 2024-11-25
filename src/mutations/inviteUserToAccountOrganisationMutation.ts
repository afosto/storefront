import { gql } from '@afosto/graphql-client';
import {
  CoreAddressFragment,
  CorePhoneNumberFragment,
  CoreRegistrationFragment,
} from '../fragments';

export const inviteUserToAccountOrganisationMutation = gql`
  ${CoreAddressFragment}
  ${CorePhoneNumberFragment}
  ${CoreRegistrationFragment}
  mutation InviteUserToAccountOrganisation(
    $invite_user_to_account_organisation_input: AddContactToAccountOrganisationInput!
  ) {
    addContactToAccountOrganisation(input: $invite_user_to_account_organisation_input) {
      organisation {
        id
        avatar
        coc_number
        created_at
        updated_at
        name
        number
        addressing {
          billing {
            primary {
              id
              ...CoreAddressFragment
            }
            secondary {
              id
              ...CoreAddressFragment
            }
          }
        }
        administration {
          email
        }
        phone_numbers {
          primary {
            id
            ...CorePhoneNumberFragment
          }
          secondary {
            id
            ...CorePhoneNumberFragment
          }
        }
        registration {
          id
          ...CoreRegistrationFragment
        }
      }
    }
  }
`;
