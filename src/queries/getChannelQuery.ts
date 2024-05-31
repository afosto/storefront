import { gql } from '@afosto/graphql-client';
import { CoreChannelFragment } from '../fragments';

export const getChannelQuery = gql`
  ${CoreChannelFragment}
  query GetChannel($id: String) {
    channel(id: $id) {
      ...CoreChannelFragment
    }
  }
`;
