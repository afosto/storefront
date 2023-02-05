import { gql } from '@afosto/graphql-client';

const CoreItemFilterFragment = gql`
  fragment CoreItemFilterFragment on ItemFilter {
    key
    values
  }
`;

export default CoreItemFilterFragment;
