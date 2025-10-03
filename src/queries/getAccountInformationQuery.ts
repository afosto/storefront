import { gql } from '@afosto/graphql-client';
import { CoreAccountFragment } from '../fragments/CoreAccountFragment';
import type { Account } from '../types';

export interface GetAccountInformationResponse {
  account: Account;
}

export const getAccountInformationQuery = gql`
  ${CoreAccountFragment}
  query GetAccountInformation {
    account {
      ...CoreAccountFragment
    }
  }
`;
