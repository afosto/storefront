import { gql } from '@afosto/graphql-client';

export interface SignInAsOrganisationInput {
  signInAsOrganisationInput: {
    organisationId: string;
  }
}

export interface SignInAsOrganisationResponse {
  logInAsOrganisation: {
    token: string;
    expires_at: number;
  };
}

export const signInAsOrganisationMutation = gql`
  mutation SignInAsOrganisation($sign_in_as_organisation_input: LogInAsOrganisationInput!) {
    logInAsOrganisation(input: $sign_in_as_organisation_input) {
      token
      expires_at
    }
  }
`;
