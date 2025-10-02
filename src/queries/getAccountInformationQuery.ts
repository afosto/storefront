import { gql } from '@afosto/graphql-client';
import { CoreAccountFragment, type CoreAccount } from '../fragments/CoreAccountFragment';

export interface GetAccountInformationResponse {
  account: CoreAccount;
}

export const getAccountInformationQuery = gql`
  ${CoreAccountFragment}
  query GetAccountInformation {
    account {
      ...CoreAccountFragment
    }
  }
`;
