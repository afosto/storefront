import { gql } from '@afosto/graphql-client';

export const deleteAccountRmaMutation = gql`
  mutation DeleteAccountRma($input: DeleteRmaInput!) {
    deleteRma(input: $input) {
      is_successful
    }
  }
`;
