import { gql } from '@afosto/graphql-client';

export const CoreOrganisationFragment = gql`
  fragment CoreOrganisationFragment on Organisation {
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
`;
