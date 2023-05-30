import { gql } from '@afosto/graphql-client';

const CoreItemFilterFragment = gql`
  fragment CoreItemFilterFragment on ItemFilter {
    key
    value
  }
`;

export default CoreItemFilterFragment;
