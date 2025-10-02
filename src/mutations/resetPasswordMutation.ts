import { gql } from '@afosto/graphql-client';

export interface ResetPasswordInput {
  resetPasswordInput: {
    token: string;
    password: string;
  }
}

export interface ResetPasswordResponse {
  resetCustomerPassword: {
    isSuccessful: boolean;
  };
}

export const resetPasswordMutation = gql`
  mutation ResetPasswordMutation($reset_password_input: ResetCustomerPasswordInput!) {
    resetCustomerPassword(input: $reset_password_input) {
      is_successful
    }
  }
`;
