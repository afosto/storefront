import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments/CoreRmaFragment';
import type { AccountRma, AccountRmaItemReason } from '../types';

export interface UpdateAccountRmaItemsInputItem {
  id: string;
  reason?: AccountRmaItemReason;
  contactNote?: string;
}

export interface UpdateAccountRmaItemsInput {
  input: {
    rmaId: string;
    items: UpdateAccountRmaItemsInputItem[];
  }
}

export interface UpdateAccountRmaItemsResponse {
  updateRmaItems: {
    rma: AccountRma;
  };
}

export const updateAccountRmaItemsMutation = gql`
  ${CoreRmaFragment}
  mutation UpdateAccountRmaItems($input: UpdateRmaItemsInput!) {
    updateRmaItems(input: $input) {
      rma {
        ...CoreRmaFragment
      }
    }
  }
`;
