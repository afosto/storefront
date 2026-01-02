import { gql } from '@afosto/graphql-client';
import { CoreProductViewingHistoryFragment } from '../fragments/CoreProductViewingHistoryFragment';
import type { ProductViewingHistory } from '../types';

export interface AddItemToProductViewingHistoryInput {
  productViewingHistoryInput: {
    token: string;
    sku: string;
    quantity: number;
    metaData?: JSON;
    expirestAt: number;
  };
}

export interface AddItemToProductViewingHistoryResponse {
  addItemToProductViewingHistory: {
    productViewingHistory: ProductViewingHistory;
  };
}

export const addItemToProductViewingHistoryMutation = gql`
  ${CoreProductViewingHistoryFragment}
  mutation AddItemToProductViewingHistory(
    $product_viewing_history_input: AddItemToProductViewingHistoryInput!
  ) {
    addItemToProductViewingHistory(input: $product_viewing_history_input) {
      productViewingHistory {
        ...CoreProductViewingHistoryFragment
      }
    }
  }
`;
