import { gql } from '@afosto/graphql-client';

export const CoreFeeFragment = gql`
  fragment CoreFeeFragment on Fee {
    description
    total
  }
`;
