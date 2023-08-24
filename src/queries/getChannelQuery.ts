import { gql } from '@afosto/graphql-client';
import { CoreChannelFragment } from '../fragments/index.js';

const getCartQuery = gql`
  ${CoreChannelFragment}
  query GetChannel($id: String) {
    channel(id: $id) {
      ...CoreChannelFragment
    }
  }
`;

export default getCartQuery;
