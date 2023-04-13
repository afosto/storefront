import { gql } from '@afosto/graphql-client';
import { CoreCartFragment } from '../fragments/index.js';

const removeCouponFromCartMutation = gql`
    ${CoreCartFragment}
    mutation RemoveCouponFromCart($coupon_input: CouponInput!) {
        removeCouponFromCart(input: $coupon_input) {
            cart {
                ...CoreCartFragment
            }
        }
    }
`;

export default removeCouponFromCartMutation;
