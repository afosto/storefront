import { gql } from '@afosto/graphql-client';

export const signInAsOrganisationMutation = gql`
  mutation SignInAsOrganisation($sign_in_as_organisation_input: LogInAsOrganisationInput!) {
    logInAsOrganisation(input: $sign_in_as_organisation_input) {
      token
      expires_at
    }
  }
`;
