import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment } from './CoreAddressFragment';
import { CoreOrganisationFragment } from './CoreOrganisationFragment';
import { CorePhoneNumberFragment } from './CorePhoneNumberFragment';

export const CoreAccountFragment = gql`
  ${CoreAddressFragment}
  ${CoreOrganisationFragment}
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
    organisations {
      id
      ...CoreOrganisationFragment
    }
    phone_numbers {
      id
      ...CorePhoneNumberFragment
    }
    shared_organisations {
      id
      ...CoreOrganisationFragment
    }
  }
`;
