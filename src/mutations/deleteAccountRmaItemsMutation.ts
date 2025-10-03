import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments/CoreRmaFragment';
import type { AccountRma } from '../types';

export interface DeleteAccountRmaItemsInput {
  input: {
    rmaId: string;
    items: string[];
  }
}

export interface DeleteAccountRmaItemsResponse {
  deleteRmaItems: {
    rma: AccountRma;
  };
}

export const deleteAccountRmaItemsMutation = gql`
  ${CoreRmaFragment}
  mutation DeleteAccountRmaItems($input: DeleteRmaItemsInput!) {
    deleteRmaItems(input: $input) {
      rma {
        ...CoreRmaFragment
      }
    }
  }
`;
