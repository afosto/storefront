import { gql } from '@afosto/graphql-client';
import {
  CoreAddressFragment,
  CorePhoneNumberFragment,
  CoreRegistrationFragment,
} from '../fragments';

export const removeUserFromAccountOrganisationMutation = gql`
  ${CoreAddressFragment}
  ${CorePhoneNumberFragment}
  ${CoreRegistrationFragment}
  mutation RemoveUserFromAccountOrganisation(
    $remove_user_from_account_organisation_input: RemoveContactFromAccountOrganisationInput!
  ) {
    removeContactFromAccountOrganisation(input: $remove_user_from_account_organisation_input) {
      organisation {
        id
        type
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
