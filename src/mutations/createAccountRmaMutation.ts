import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment, type CoreRma } from '../fragments/CoreRmaFragment';
import type { AccountRmaStatus } from '../types';

export interface CreateAccountRmaInput {
  input?: {
    id?: string;
    contactId?: string;
    organisationId?: string;
    dueAt?: number;
    status?: AccountRmaStatus;
  }
}

export interface CreateAccountRmaResponse {
  createRma: {
    rma: CoreRma;
  };
}

export const createAccountRmaMutation = gql`
  ${CoreRmaFragment}
  mutation CreateAccountRma($input: CreateRmaInput!) {
    createRma(input: $input) {
      rma {
        ...CoreRmaFragment
      }
    }
  }
`;
