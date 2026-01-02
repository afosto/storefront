import { gql } from '@afosto/graphql-client';
import { CoreProductViewingHistoryFragment } from '../fragments/CoreProductViewingHistoryFragment';

export interface DeleteProductViewingHistoryInput {
  productViewingHistoryInput: {
    token: string;
  };
}

export interface DeleteProductViewingHistoryResponse {
  deleteProductViewingHistory: {
    success: boolean;
  };
}

export const deleteProductViewingHistoryMutation = gql`
  ${CoreProductViewingHistoryFragment}
  mutation DeleteProductViewingHistory(
    $product_viewing_history_input: DeleteProductViewingHistoryInput!
  ) {
    deleteProductViewingHistory(input: $product_viewing_history_input) {
      success
    }
  }
`;
