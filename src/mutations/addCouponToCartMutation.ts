import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments/CoreCartFragment';
import type { Cart } from '../types';

export interface AddCouponToCartInput {
  couponInput: {
    cartId: string;
    coupon: string;
  };
}

export interface AddCouponToCartResponse {
  addCouponToCart: {
    cart: Cart;
  };
}

export const addCouponToCartMutation = gql`
    ${CoreCartFragment}
    mutation AddCouponToCart($coupon_input: CouponInput!) {
        addCouponToCart(input: $coupon_input) {
            cart {
                ...CoreCartFragment
            }
        }
    }
`;
