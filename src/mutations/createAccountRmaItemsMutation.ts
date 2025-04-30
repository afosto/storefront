import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments';

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
