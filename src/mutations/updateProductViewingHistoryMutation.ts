import { gql } from '@afosto/graphql-client';
import { CoreProductViewingHistoryFragment } from '../fragments/CoreProductViewingHistoryFragment';
import type { ProductViewingHistory } from '../types';

export interface UpdateProductViewingHistoryInput {
  productViewingHistoryInput: {
    token: string;
    label: string;
    expiresAt: number;
  };
}

export interface UpdateProductViewingHistoryResponse {
  updateProductViewingHistory: {
    productViewingHistory: ProductViewingHistory;
  };
}

export const updateProductViewingHistoryMutation = gql`
  ${CoreProductViewingHistoryFragment}
  mutation UpdateProductViewingHistory(
    $product_viewing_history_input: UpdateProductViewingHistoryInput!
  ) {
    updateProductViewingHistory(input: $product_viewing_history_input) {
      productViewingHistory {
        ...CoreProductViewingHistoryFragment
      }
    }
  }
`;
