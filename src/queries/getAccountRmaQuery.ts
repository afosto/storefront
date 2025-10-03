import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments/CoreRmaFragment';
import type { AccountRma } from '../types';

export interface GetAccountRmaParams {
  id: string;
}

export interface GetAccountRmaResponse {
  rma: AccountRma;
}

export const getAccountRmaQuery = gql`
  ${CoreRmaFragment}
  query GetAccountRma($id: String!) {
    rma(id: $id) {
      ...CoreRmaFragment
    }
  }
`;
