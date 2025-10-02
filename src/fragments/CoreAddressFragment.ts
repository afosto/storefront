import { gql } from '@afosto/graphql-client';

export interface CoreAddress {
  countryCode: string;
  administrativeArea: string;
  locality: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  thoroughfare: string;
  premiseNumber: number;
  premiseNumberSuffix: string;
  givenName: string;
  additionalName: string;
  familyName: string;
  organisation: string;
  options: {
    format: {
      address: string;
    };
  };
}

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
