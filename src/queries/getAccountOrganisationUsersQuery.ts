import { gql } from '@afosto/graphql-client';
import { CorePhoneNumberFragment } from '../fragments';

export const getAccountOrganisationUsersQuery = gql`
  ${CorePhoneNumberFragment}

  query GetAccountOrganisationUsers {
    account {
      shared_organisations {
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
