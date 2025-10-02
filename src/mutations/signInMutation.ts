import { gql } from '@afosto/graphql-client';

export interface SignInInput {
  signInInput: {
    email: string;
    password: string;
  }
}

export interface SignInResponse {
  logInCustomer: {
    token: string;
    expires_at: number;
  };
}

export const signInMutation = gql`
  mutation SignInMutation($sign_in_input: LogInCustomerInput!) {
    logInCustomer(input: $sign_in_input) {
      token
      expires_at
    }
  }
`;
