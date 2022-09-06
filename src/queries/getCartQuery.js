import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments';

const getCartQuery = gql`
  ${CoreCartFragment}
  query GetCart($id: String!, $intent: TrackingEvent) {
    cart(id: $id, intent: $intent) {
      ...CoreCartFragment
    }
  }
`;

export default getCartQuery;
