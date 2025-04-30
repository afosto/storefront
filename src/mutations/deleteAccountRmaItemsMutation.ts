import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments';

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
