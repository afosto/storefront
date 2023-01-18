import { gql } from '@afosto/graphql-client';

const CoreFeeFragment = gql`
  fragment CoreFeeFragment on Fee {
    description
    total
  }
`;

export default CoreFeeFragment;
