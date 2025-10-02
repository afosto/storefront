import { gql } from '@afosto/graphql-client';
import { CoreCartFragment, type CoreCart } from '../fragments/CoreCartFragment';

export interface RemoveCouponFromCartInput {
  couponInput: {
    cartId: string;
    coupon: string;
  }
}

export interface RemoveCouponFromCartResponse {
  removeCouponFromCart: {
    cart: CoreCart;
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
