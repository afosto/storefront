import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments/CoreRmaFragment';
import type { CreateAccountRmaInput } from './createAccountRmaMutation';
import type { CreateAccountRmaItemsInput } from './createAccountRmaItemsMutation';
import type { AccountRma } from '../types';

export interface CreateAccountRmaWithItemsInput {
  input: CreateAccountRmaInput['input'];
  itemsInput: CreateAccountRmaItemsInput['input'];
}

export interface CreateAccountRmaWithItemsResponse {
  createRma: {
    rma: {
      id: string;
    };
  };
  createRmaItems: {
    rma: AccountRma;
  };
}

export const createAccountRmaWithItemsMutation = gql`
  ${CoreRmaFragment}
  mutation CreateAccountRmaWithItems($input: CreateRmaInput!, $items_input: CreateRmaItemsInput!) {
    createRma(input: $input) {
      rma {
        id
      }
    }
    createRmaItems(input: $items_input) {
      rma {
        ...CoreRmaFragment
      }
    }
  }
`;
