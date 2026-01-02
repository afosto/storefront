import { gql } from '@afosto/graphql-client';
import { CoreProductViewingHistoryFragment } from '../fragments/CoreProductViewingHistoryFragment';
import type { ProductViewingHistory } from '../types';

export interface GetProductViewingHistoryParams {
  token: string;
}

export interface GetProductViewingHistoryResponse {
  productViewingHistory: ProductViewingHistory;
}

export const getProductViewingHistoryQuery = gql`
  ${CoreProductViewingHistoryFragment}
  query GetProductViewingHistory($token: String!) {
    productViewingHistory(token: $token) {
      ...CoreProductViewingHistoryFragment
    }
  }
`;
