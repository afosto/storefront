import { gql } from '@afosto/graphql-client';

export const signUpMutation = gql`
  mutation SignUpMutation($sign_up_input: RegisterCustomerInput!) {
    registerCustomer(input: $sign_up_input) {
      token
      expires_at
    }
  }
`;
