import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments/CoreCartFragment';
import type { Cart } from '../types';

export interface RemoveCouponFromCartInput {
  couponInput: {
    cartId: string;
    coupon: string;
  }
}

export interface RemoveCouponFromCartResponse {
  removeCouponFromCart: {
    cart: Cart;
  };
}

export const removeCouponFromCartMutation = gql`
    ${CoreCartFragment}
    mutation RemoveCouponFromCart($coupon_input: CouponInput!) {
        removeCouponFromCart(input: $coupon_input) {
            cart {
                ...CoreCartFragment
            }
        }
    }
`;
