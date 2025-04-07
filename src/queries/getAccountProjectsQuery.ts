import { gql } from '@afosto/graphql-client';

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
          name
        }
      }
    }
  }
`;
