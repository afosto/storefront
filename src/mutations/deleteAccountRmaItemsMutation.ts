import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment, type CoreRma } from '../fragments/CoreRmaFragment';

export interface DeleteAccountRmaItemsInput {
  input: {
    rmaId: string;
    items: string[];
  }
}

export interface DeleteAccountRmaItemsResponse {
  deleteRmaItems: {
    rma: CoreRma;
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
