import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments';

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
