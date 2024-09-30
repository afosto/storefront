import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment } from './CoreAddressFragment';
import { CorePhoneNumberFragment } from './CorePhoneNumberFragment';
import { CoreRegistrationFragment } from './CoreRegistrationFragment';

export const CoreAccountFragment = gql`
  ${CoreAddressFragment}
  ${CorePhoneNumberFragment}
  ${CoreRegistrationFragment}
  fragment CoreAccountFragment on Account {
    email
    given_name
    additional_name
    family_name
    created_at
    updated_at
    billing {
      id
      ...CoreAddressFragment
      is_valid
      errors
    }
    shipping {
      id
      ...CoreAddressFragment
      is_valid
      errors
    }
    organisations {
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
    phone_numbers {
      id
      ...CorePhoneNumberFragment
    }
  }
`;
