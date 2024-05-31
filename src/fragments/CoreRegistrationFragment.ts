import { gql } from '@afosto/graphql-client';

export const CoreRegistrationFragment = gql`
  fragment CoreRegistrationFragment on Registration {
    country_code
    number
  }
`;
