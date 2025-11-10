import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment, type CoreAddress } from '../fragments/CoreAddressFragment';
import { CoreFeeFragment, type CoreFee } from '../fragments/CoreFeeFragment';
import { CoreVatAmountFragment, type CoreVatAmount } from '../fragments/CoreVatAmountFragment';
import { type CoreAdjustment } from '../fragments/CoreAdjustmentFragment';

export interface GetAccountOrderParams {
  id: string;
}

export interface AccountOrderCustomer {
  countryCode: string;
  locale: string;
  notes: string;
  reference: string;
}

export interface AccountOrderPaymentMethodPricing {
  fixed: number;
  percentage: number;
}

export interface AccountOrderPaymentMethod {
  id: string;
  code: string;
  description: string;
  instruction: string;
  name: string;
  pricing: AccountOrderPaymentMethodPricing;
}

export interface AccountOrderPaymentDetails {
  type: string;
  status: string;
  amountPaid: number;
  isRefund: boolean;
  paidAt: number;
}

export interface AccountOrderPayment {
  id: string;
  amount: number;
  type: string;
  details: AccountOrderPaymentDetails;
}

export interface AccountOrderInvoice {
  id: string;
  createdAt: number;
  number: string;
  pdfUrl: string;
  total: number;
}

export interface AccountOrderItemPricing {
  amount: number;
}

export interface AccountOrderItemDeliveryMethod {
  id: string;
  name: string;
  description: string;
  instruction: string;
  carrier: string;
}

export interface AccountOrderItemDeliveryPickupPoint {
  id: string;
  name: string;
  carrier: string;
  distance: number;
  address: CoreAddress & {
    id: string;
  };
}

export interface AccountOrderItemDeliveryLocation {
  id: string;
  name: string;
  address: CoreAddress & {
    id: string;
  };
}

export interface AccountOrderItemDeliveryTo {
  address: CoreAddress & {
    id: string;
  };
  pickupPoint: AccountOrderItemDeliveryPickupPoint;
  location: AccountOrderItemDeliveryLocation;
}

export interface AccountOrderItemDelivery {
  method: AccountOrderItemDeliveryMethod;
  to: AccountOrderItemDeliveryTo;
  expectedAt: number;
  status: string;
  trackTraceCode: string;
  trackTraceUrl: string;
}

export interface AccountOrderItem {
  sku: string;
  type: string;
  image: string;
  label: string;
  brand: string;
  mpn: string;
  gtin: string[];
  url: string;
  quantity: number;
  pricing: AccountOrderItemPricing;
  delivery: AccountOrderItemDelivery;
}

export interface AccountOrder {
  id: string;
  number: string;
  createdAt: number;
  updatedAt: number;
  isCancelled: boolean;
  isIncludingVat: boolean;
  isVatShifted: boolean;
  subtotal: number;
  total: number;
  totalExcludingVat: number;
  coupons: string[];
  currency: string;
  processing: string[];
  customer: AccountOrderCustomer;
  billingAddress: CoreAddress & {
    id: string;
  };
  fees: {
    shipping: CoreFee[];
    payment: CoreFee[];
  };
  paymentMethod: AccountOrderPaymentMethod;
  vat: CoreVatAmount[];
  adjustments: CoreAdjustment[];
  payments: AccountOrderPayment[];
  invoices: AccountOrderInvoice[];
  items: AccountOrderItem[];
  metaData: Record<string, unknown>;
}

export interface GetAccountOrderResponse {
  account: {
    order: AccountOrder;
  };
}

export const getAccountOrderQuery = gql`
  ${CoreAddressFragment}
  ${CoreFeeFragment}
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
        processing
        customer {
          country_code
          locale
          notes
          reference
        }
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
          id
          code
          description
          instruction
          name
          pricing {
            fixed
            percentage
          }
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
          outcome {
            amount
          }
        }
        invoices {
          id
          created_at
          number
          pdf_url
          total
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
