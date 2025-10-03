import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments/CoreRmaFragment';
import type { AccountRma, AccountRmaStatus } from '../types';

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
    rma: AccountRma;
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
