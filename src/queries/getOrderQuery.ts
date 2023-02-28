import { gql } from '@afosto/graphql-client';
import { CoreOrderFragment } from '../fragments/index.js';

const getOrderQuery = gql`
  ${CoreOrderFragment}
  query GetOrder($id: String!) {
    order(id: $id) {
      ...CoreOrderFragment
    }
  }
`;

export default getOrderQuery;
