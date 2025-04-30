import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments';

export const getAccountRmaQuery = gql`
  ${CoreRmaFragment}
  query GetAccountRma($id: String!) {
    rma(id: $id) {
      ...CoreRmaFragment
    }
  }
`;
