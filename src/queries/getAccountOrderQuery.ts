import { gql } from '@afosto/graphql-client';
import {
  CoreAddressFragment,
  CoreFeeFragment,
  CorePaymentMethodSummaryFragment,
  CoreVatAmountFragment
} from '../fragments';

export const getAccountOrderQuery = gql`
  ${CoreAddressFragment}
  ${CoreFeeFragment}
  ${CorePaymentMethodSummaryFragment}
  ${CoreVatAmountFragment}
  query GetAccountOrder($id: String!) {
    account {
      order(id: $id) {
        id
        number
        created_at
        updated_at
        is_cancelled
        is_including_vat
        is_vat_shifted
        subtotal
        total
        total_excluding_vat
        coupons
        currency
        billing_address {
          id
          ...CoreAddressFragment
        }
        fees {
          payment {
            ...CoreFeeFragment
          }
          shipping {
            ...CoreFeeFragment
          }
        }
        payment_method {
          ...CorePaymentMethodSummaryFragment
        }
        vat {
          ...CoreVatAmountFragment
        }
        payments {
          id
          amount
          type
          details {
            type
            status
            amount_paid
            is_refund
            currency
            paid_at
          }
        }
        adjustments {
          id
          amount
          description
          is_percentage
          is_discount
        }
        items {
          sku
          type
          image
          label
          brand
          mpn
          gtin
          url
          quantity
          pricing {
            amount
          }
          delivery {
            method {
              id
              name
              description
              instruction
              carrier
            }
            to {
              address {
                id
                ...CoreAddressFragment
              }
              pickup_point {
                id
                name
                carrier
                distance
                address {
                  id
                  ...CoreAddressFragment
                }
              }
              location {
                id
                name
                address {
                  id
                  ...CoreAddressFragment
                }
              }
            }
            expected_at
            status
            track_trace_code
            track_trace_url
          }
        }
        meta_data
      }
    }
  }
`;
