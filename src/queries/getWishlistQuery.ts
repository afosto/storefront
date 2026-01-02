import { gql } from '@afosto/graphql-client';
import { CoreWishlistFragment } from '../fragments/CoreWishlistFragment';
import type { Wishlist } from '../types';

export interface GetWishlistParams {
  token: string;
}

export interface GetWishlistResponse {
  wishlist: Wishlist;
}

export const getWishlistQuery = gql`
  ${CoreWishlistFragment}
  query GetWishlist($token: String!) {
    wishlist(token: $token) {
      ...CoreWishlistFragment
    }
  }
`;
