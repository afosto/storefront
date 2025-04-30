import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments';

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
