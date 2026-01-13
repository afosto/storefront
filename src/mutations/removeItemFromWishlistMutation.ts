import { gql } from '@afosto/graphql-client';
import { CoreWishlistFragment } from '../fragments/CoreWishlistFragment';
import type { Wishlist } from '../types';

export interface RemoveItemFromWishlistInput {
  wishlistInput: {
    token: string;
    sku: string;
  };
}

export interface RemoveItemFromWishlistResponse {
  removeItemFromWishlist: {
    wishlist: Wishlist;
  };
}

export const removeItemFromWishlistMutation = gql`
  ${CoreWishlistFragment}
  mutation RemoveItemFromWishlist($wishlist_input: RemoveItemFromWishlistInput!) {
    removeItemFromWishlist(input: $wishlist_input) {
      wishlist {
        ...CoreWishlistFragment
      }
    }
  }
`;
