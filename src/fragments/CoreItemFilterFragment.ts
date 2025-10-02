import { gql } from '@afosto/graphql-client';

export interface CoreItemFilter {
  key: string;
  value: string;
}

export const CoreItemFilterFragment = gql`
  fragment CoreItemFilterFragment on ItemFilter {
    key
    value
  }
`;
