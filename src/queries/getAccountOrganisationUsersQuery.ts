import { gql } from '@afosto/graphql-client';

export const getAccountOrganisationUsersQuery = gql`
  query GetAccountOrganisationUsers {
    account {
      shared_organisations {
        id
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
