import { gql } from '@afosto/graphql-client';

export const signInMutation = gql`
  mutation SignInMutation($sign_in_input: LogInCustomerInput!) {
    logInCustomer(input: $sign_in_input) {
      token
      expires_at
    }
  }
`;
