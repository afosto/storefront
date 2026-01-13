import { gql } from '@afosto/graphql-client';

export interface DeleteWishlistInput {
  wishlistInput: {
    token: string;
  };
}

export interface DeleteWishlistResponse {
  deleteWishlist: {
    success: boolean;
  };
}

export const deleteWishlistMutation = gql`
  mutation DeleteWishlist($wishlist_input: DeleteWishlistInput!) {
    deleteWishlist(input: $wishlist_input) {
      success
    }
  }
`;
