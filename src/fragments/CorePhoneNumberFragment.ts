import { gql } from '@afosto/graphql-client';

export interface CorePhoneNumber {
  id: string;
  countryCode: string;
  national: string;
  number: string;
}

export const CorePhoneNumberFragment = gql`
  fragment CorePhoneNumberFragment on PhoneNumber {
    id
    country_code
    national
    number
  }
`;
