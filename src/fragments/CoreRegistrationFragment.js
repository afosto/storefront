import { gql } from '@afosto/graphql-client';

const CoreRegistrationFragment = gql`
  fragment CoreRegistrationFragment on Registration {
    country_code
    number
  }
`;

export default CoreRegistrationFragment;
