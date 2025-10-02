import { gql } from '@afosto/graphql-client';

export interface RequestPasswordResetInput {
  requestPasswordResetInput: {
    email: string;
  }
}

export interface RequestPasswordResetResponse {
  requestCustomerPasswordReset: {
    isSuccessful: boolean;
  };
}

export const requestPasswordResetMutation = gql`
  mutation RequestPasswordResetMutation($request_password_reset_input: RequestCustomerPasswordResetInput!) {
    requestCustomerPasswordReset(input: $request_password_reset_input) {
      is_successful
    }
  }
`;
