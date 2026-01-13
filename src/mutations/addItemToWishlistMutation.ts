import { gql } from '@afosto/graphql-client';
import { CoreWishlistFragment } from '../fragments/CoreWishlistFragment';
import type { Wishlist } from '../types';

export interface AddItemToWishlistInput {
  wishlistInput: {
    token: string;
    sku: string;
    quantity: number;
    metaData?: JSON;
    expirestAt: number;
  };
}

export interface AddItemToWishlistResponse {
  addItemToWishlist: {
    wishlist: Wishlist;
  };
}

export const addItemToWishlistMutation = gql`
  ${CoreWishlistFragment}
  mutation AddItemToWishlist($wishlist_input: AddItemToWishlistInput!) {
    addItemToWishlist(input: $wishlist_input) {
      wishlist {
        ...CoreWishlistFragment
      }
    }
  }
`;
