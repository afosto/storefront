import { gql } from '@afosto/graphql-client';

export const CorePhoneNumberFragment = gql`
  fragment CorePhoneNumberFragment on PhoneNumber {
    country_code
    national
    number
  }
`;
