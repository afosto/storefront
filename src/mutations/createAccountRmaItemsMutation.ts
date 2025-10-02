import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment, type CoreRma } from '../fragments/CoreRmaFragment';
import type { AccountRmaItemReason } from '../types';

export interface CreateAccountRmaItemInput {
  id?: string;
  sku: string;
  orderId: string;
  reason?: AccountRmaItemReason;
  contactNote?: string;
}

export interface CreateAccountRmaItemsInput {
  input: {
    rmaId: string;
    items: CreateAccountRmaItemInput[];
  }
}

export interface CreateAccountRmaItemsResponse {
  createRmaItems: {
    rma: CoreRma;
  };
}

export const createAccountRmaItemsMutation = gql`
  ${CoreRmaFragment}
  mutation CreateAccountRmaItems($input: CreateRmaItemsInput!) {
    createRmaItems(input: $input) {
      rma {
        ...CoreRmaFragment
      }
    }
  }
`;
