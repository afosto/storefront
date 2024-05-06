import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment } from './CoreAddressFragment';
import { CorePhoneNumberFragment } from './CorePhoneNumberFragment';

export const CoreAccountFragment =  gql`
  ${CoreAddressFragment}
  ${CorePhoneNumberFragment}
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
    phone_numbers {
      id
      ...CorePhoneNumberFragment
    }
  }
`;
