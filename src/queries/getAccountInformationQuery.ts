import { gql } from '@afosto/graphql-client';
import { CoreAccountFragment } from '../fragments';

export const getAccountInformationQuery = gql`
  ${CoreAccountFragment}
  query GetAccountInformation {
    account {
      ...CoreAccountFragment
    }
  }
`;
