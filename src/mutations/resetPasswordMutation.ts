import { gql } from '@afosto/graphql-client';

export const resetPasswordMutation = gql`
  mutation ResetPasswordMutation($reset_password_input: ResetCustomerPasswordInput!) {
    resetCustomerPassword(input: $reset_password_input) {
      is_successful
    }
  }
`;
