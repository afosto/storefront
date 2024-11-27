import { gql } from '@afosto/graphql-client';

export const signOutOfOrganisationMutation = gql`
  mutation SignOutOfOrganisation {
    logOutAsOrganisation {
      token
      expires_at
    }
  }
`;
