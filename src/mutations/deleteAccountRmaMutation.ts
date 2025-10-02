import { gql } from '@afosto/graphql-client';

export interface DeleteAccountRmaInput {
  input: {
    id: string;
  }
}

export interface DeleteAccountRmaResponse {
  deleteRma: {
    isSuccessful: boolean;
  };
}

export const deleteAccountRmaMutation = gql`
  mutation DeleteAccountRma($input: DeleteRmaInput!) {
    deleteRma(input: $input) {
      is_successful
    }
  }
`;
