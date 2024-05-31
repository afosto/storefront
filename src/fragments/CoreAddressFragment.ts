import { gql } from '@afosto/graphql-client';

export const CoreAddressFragment = gql`
  fragment CoreAddressFragment on Address {
    country_code
    administrative_area
    locality
    postal_code
    address_line_1
    address_line_2
    thoroughfare
    premise_number
    premise_number_suffix
    given_name
    additional_name
    family_name
    organisation
    options {
      format {
        address
      }
    }
  }
`;
