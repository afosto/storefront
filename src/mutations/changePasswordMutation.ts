import { gql } from '@afosto/graphql-client';

export const changePasswordMutation = gql`
  mutation ChangePasswordMutation($change_password_input: SetPasswordForAccountInput!) {
    setPasswordForAccount(input: $change_password_input) {
      account {
        email
      }
    }
  }
`;
