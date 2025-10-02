import { gql } from '@afosto/graphql-client';
import { CoreCartFragment, type CoreCart } from '../fragments/CoreCartFragment';

export interface AddCouponToCartInput {
  couponInput: {
    cartId: string;
    coupon: string;
  };
}

export interface AddCouponToCartResponse {
  addCouponToCart: {
    cart: CoreCart;
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
