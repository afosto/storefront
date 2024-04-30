import { gql } from '@afosto/graphql-client';

export const verifyUserMutation = gql`
  mutation VerifyUserMutation($verify_user_input: VerifyCustomerInput!) {
    verifyCustomer(input: $verify_user_input) {
      token
      expires_at
    }
  }
`;
