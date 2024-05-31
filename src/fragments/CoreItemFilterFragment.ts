import { gql } from '@afosto/graphql-client';

export const CoreItemFilterFragment = gql`
  fragment CoreItemFilterFragment on ItemFilter {
    key
    value
  }
`;
