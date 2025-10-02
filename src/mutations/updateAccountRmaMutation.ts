import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment, type CoreRma } from '../fragments/CoreRmaFragment';
import type { AccountRmaStatus } from '../types';

export interface UpdateAccountRmaInput {
  input: {
    id: string;
    status?: AccountRmaStatus;
    addressId?: string;
    dueAt?: number;
  }
}

export interface UpdateAccountRmaResponse {
  updateRma: {
    rma: CoreRma;
  };
}

export const updateAccountRmaMutation = gql`
  ${CoreRmaFragment}
  mutation UpdateAccountRma($input: UpdateRmaInput!) {
    updateRma(input: $input) {
      rma {
        ...CoreRmaFragment
      }
    }
  }
`;
