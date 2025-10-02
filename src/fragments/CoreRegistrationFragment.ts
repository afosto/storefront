import { gql } from '@afosto/graphql-client';

export interface CoreRegistration {
  id: string;
  countryCode: string;
  number: string;
}

export const CoreRegistrationFragment = gql`
  fragment CoreRegistrationFragment on Registration {
    id
    country_code
    number
  }
`;
