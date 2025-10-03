import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments/CoreCartFragment';
import type { Cart } from '../types';

export type CartIntent = 'BEGIN_CHECKOUT' | 'VIEW_CART';

export interface GetCartParams {
  id: string;
  intent?: CartIntent;
}

export interface GetCartResponse {
  cart: Cart;
}

export const getCartQuery = gql`
  ${CoreCartFragment}
  query GetCart($id: String!, $intent: TrackingEvent) {
    cart(id: $id, intent: $intent) {
      ...CoreCartFragment
    }
  }
`;
