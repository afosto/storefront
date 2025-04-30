import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments';

export const updateAccountRmaMutation = gql`
  ${CoreRmaFragment}
  mutation UpdateAccountRma($input: UpdateRmaInput!) {
    updateRma(input: $input) {
      rma {
        ...CoreRmaFragment
      }
    }
  }
`;
