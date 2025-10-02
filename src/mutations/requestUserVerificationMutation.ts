import { gql } from '@afosto/graphql-client';

export interface RequestUserVerificationInput {
  requestUserVerificationInput: {
    email: string;
  }
}

export interface RequestUserVerificationResponse {
  requestCustomerVerificationLink: {
    isSuccessful: boolean;
  };
}

export const requestUserVerificationMutation = gql`
  mutation RequestPasswordResetMutation($request_user_verification_input: RequestCustomerVerificationLinkInput!) {
    requestCustomerVerificationLink(input: $request_user_verification_input) {
      is_successful
    }
  }
`;
