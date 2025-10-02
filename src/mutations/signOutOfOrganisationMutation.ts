import { gql } from '@afosto/graphql-client';

export interface SignOutOfOrganisationResponse {
  logOutAsOrganisation: {
    token: string;
    expiresAt: number;
  };
}

export const signOutOfOrganisationMutation = gql`
  mutation SignOutOfOrganisation {
    logOutAsOrganisation {
      token
      expires_at
    }
  }
`;
