import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment } from './CoreAddressFragment';
import { CorePhoneNumberFragment } from './CorePhoneNumberFragment';
import { CoreRegistrationFragment } from './CoreRegistrationFragment';

export const CoreOrganisationFragment = gql`
  ${CoreAddressFragment}
  ${CorePhoneNumberFragment}
  ${CoreRegistrationFragment}
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
