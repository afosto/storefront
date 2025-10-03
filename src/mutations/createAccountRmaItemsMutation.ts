import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments/CoreRmaFragment';
import type { AccountRma, AccountRmaItemReason } from '../types';

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
    rma: AccountRma;
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
