import { gql } from '@afosto/graphql-client';

export interface AccountProjectsProject {
  id: string;
  name: string;
  number: string;
  description: string;
  metaData: Record<string, unknown>;
  startsAt: number;
  endsAt: number;
  organisation: {
    id: string;
  };
}

export interface GetAccountProjectsResponse {
  account: {
    projects: AccountProjectsProject[];
  };
}

export const getAccountProjectsQuery = gql`
  query GetAccountProjects {
    account {
      projects {
        id
        name
        number
        description
        meta_data
        starts_at
        ends_at
        organisation {
          id
        }
      }
    }
  }
`;
