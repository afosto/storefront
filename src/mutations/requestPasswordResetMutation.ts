import { gql } from '@afosto/graphql-client';

export const requestPasswordResetMutation = gql`
  mutation RequestPasswordResetMutation($request_password_reset_input: RequestCustomerPasswordResetInput!) {
    requestCustomerPasswordReset(input: $request_password_reset_input) {
      is_successful
    }
  }
`;
