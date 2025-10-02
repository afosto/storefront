import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment, type CoreRma } from '../fragments/CoreRmaFragment';

export interface GetAccountRmaParams {
  id: string;
}

export interface GetAccountRmaResponse {
  rma: CoreRma;
}

export const getAccountRmaQuery = gql`
  ${CoreRmaFragment}
  query GetAccountRma($id: String!) {
    rma(id: $id) {
      ...CoreRmaFragment
    }
  }
`;
