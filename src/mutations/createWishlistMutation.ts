import { gql } from '@afosto/graphql-client';
import { CoreWishlistFragment } from '../fragments/CoreWishlistFragment';
import type { Wishlist } from '../types';

export interface CreateWishlistInput {
  wishlistInput: {
    label: string;
    expiresAt: number;
  };
}

export interface CreateWishlistResponse {
  createWishlist: {
    wishlist: Wishlist;
  };
}

export const createWishlistMutation = gql`
  ${CoreWishlistFragment}
  mutation CreateWishlist($wishlist_input: CreateWishlistInput!) {
    createWishlist(input: $wishlist_input) {
      wishlist {
        ...CoreWishlistFragment
      }
    }
  }
`;
