import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments';

export const reorderMutation = gql`
  ${CoreCartFragment}
  mutation Reorder($reorder_input: ReorderInput!) {
    reorder(input: $reorder_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;
