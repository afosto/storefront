import { gql } from '@afosto/graphql-client';

export const requestUserVerificationMutation = gql`
  mutation RequestPasswordResetMutation($request_user_verification_input: RequestCustomerVerificationLinkInput!) {
    requestCustomerVerificationLink(input: $request_user_verification_input) {
      is_successful
    }
  }
`;
