import { gql } from '@afosto/graphql-client';

export interface VerifyUserInput {
  verifyUserInput: {
    token: string;
  }
}

export interface VerifyUserResponse {
  verifyCustomer: {
    token: string;
    expiresAt: number;
  };
}

export const verifyUserMutation = gql`
  mutation VerifyUserMutation($verify_user_input: VerifyCustomerInput!) {
    verifyCustomer(input: $verify_user_input) {
      token
      expires_at
    }
  }
`;
