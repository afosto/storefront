import { gql } from '@afosto/graphql-client';
import { CoreProductViewingHistoryFragment } from '../fragments/CoreProductViewingHistoryFragment';
import type { ProductViewingHistory } from '../types';

export interface CreateProductViewingHistoryInput {
  productViewingHistoryInput: {
    label: string;
    expiresAt: number;
  };
}

export interface CreateProductViewingHistoryResponse {
  createProductViewingHistory: {
    productViewingHistory: ProductViewingHistory;
  };
}

export const createProductViewingHistoryMutation = gql`
  ${CoreProductViewingHistoryFragment}
  mutation CreateProductViewingHistory(
    $product_viewing_history_input: CreateProductViewingHistoryInput!
  ) {
    createProductViewingHistory(input: $product_viewing_history_input) {
      productViewingHistory {
        ...CoreProductViewingHistoryFragment
      }
    }
  }
`;
