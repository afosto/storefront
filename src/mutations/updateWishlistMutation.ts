import { gql } from '@afosto/graphql-client';
import { CoreWishlistFragment } from '../fragments/CoreWishlistFragment';
import type { Wishlist } from '../types';

export interface UpdateWishlistInput {
  wishlistInput: {
    token: string;
    label: string;
    expiresAt: number;
  };
}

export interface UpdateWishlistResponse {
  updateWishlist: {
    wishlist: Wishlist;
  };
}

export const updateWishlistMutation = gql`
  ${CoreWishlistFragment}
  mutation UpdateWishlist($wishlist_input: UpdateWishlistInput!) {
    updateWishlist(input: $wishlist_input) {
      wishlist {
        ...CoreWishlistFragment
      }
    }
  }
`;
