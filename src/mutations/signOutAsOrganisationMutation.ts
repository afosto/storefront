import { gql } from '@afosto/graphql-client';

export const signOutAsOrganisationMutation = gql`
  mutation SignOutAsOrganisation {
    logOutAsOrganisation {
      token
      expires_at
    }
  }
`;
