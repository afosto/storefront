import { gql } from '@afosto/graphql-client';
import { CoreOrderFragment } from '../fragments';

export const getOrderQuery = gql`
  ${CoreOrderFragment}
  query GetOrder($id: String!) {
    order(id: $id) {
      ...CoreOrderFragment
    }
  }
`;
