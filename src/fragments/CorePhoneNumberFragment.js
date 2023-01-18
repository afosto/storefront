import { gql } from '@afosto/graphql-client';

const CorePhoneNumberFragment = gql`
  fragment CorePhoneNumberFragment on PhoneNumber {
    country_code
    national
    number
  }
`;

export default CorePhoneNumberFragment;
