import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments';

const getCartQuery = gql`
  ${CoreCartFragment}
  query GetCart($id: String!) {
    cart(id: $id) {
      ...CoreCartFragment
    }
  }
`;

export default getCartQuery;

