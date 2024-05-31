import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments';

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
