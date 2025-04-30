import { gql } from '@afosto/graphql-client';
import { CoreRmaFragment } from '../fragments';

export const createAccountRmaMutation = gql`
  ${CoreRmaFragment}
  mutation CreateAccountRma($input: CreateRmaInput!) {
    createRma(input: $input) {
      rma {
        ...CoreRmaFragment
      }
    }
  }
`;
