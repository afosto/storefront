import { gql } from '@afosto/graphql-client';

export interface ChangePasswordInput {
  changePasswordInput: {
    newPassword: string;
    password: string;
  }
}

export interface ChangePasswordResponse {
  setPasswordForAccount: {
    account: {
      email: string;
    };
  }
}

export const changePasswordMutation = gql`
  mutation ChangePasswordMutation($change_password_input: SetPasswordForAccountInput!) {
    setPasswordForAccount(input: $change_password_input) {
      account {
        email
      }
    }
  }
`;
