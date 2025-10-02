import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment, type CoreAddress } from '../fragments/CoreAddressFragment';
import { CoreFeeFragment, type CoreFee } from '../fragments/CoreFeeFragment';
import { CoreVatAmountFragment, type CoreVatAmount } from '../fragments/CoreVatAmountFragment';
import { type CoreAdjustment } from '../fragments/CoreAdjustmentFragment';

export interface GetAccountOrderParams {
  id: string;
}

export interface GetAccountOrderResponseOrderPaymentMethodPricing {
  fixed: number;
  percentage: number;
}

export interface GetAccountOrderResponseOrderPaymentMethod {
  id: string;
  code: string;
  description: string;
  instruction: string;
  name: string;
  pricing: GetAccountOrderResponseOrderPaymentMethodPricing;
}

export interface GetAccountOrderResponseOrderPaymentDetails {
  type: string;
  status: string;
  amountPaid: number;
  isRefund: boolean;
  paidAt: number;
}

export interface GetAccountOrderResponseOrderPayment {
  id: string;
  amount: number;
  type: string;
  details: GetAccountOrderResponseOrderPaymentDetails;
}

export interface GetAccountOrderResponseOrderInvoice {
  id: string;
  createdAt: number;
  number: string;
  pdfUrl: string;
  total: number;
}

export interface GetAccountOrderResponseOrderItemPricing {
  amount: number;
}

export interface GetAccountOrderResponseOrderItemDeliveryMethod {
  id: string;
  name: string;
  description: string;
  instruction: string;
  carrier: string;
}


export interface GetAccountOrderResponseOrderItemDeliveryPickupPoint {
  id: string;
  name: string;
  carrier: string;
  distance: number;
  address: CoreAddress & {
    id: string;
  };
}

export interface GetAccountOrderResponseOrderItemDeliveryLocation {
  id: string;
  name: string;
  address: CoreAddress & {
    id: string;
  };
}

export interface GetAccountOrderResponseOrderItemDeliveryTo {
  address: CoreAddress & {
    id: string;
  };
  pickupPoint: GetAccountOrderResponseOrderItemDeliveryPickupPoint;
  location: GetAccountOrderResponseOrderItemDeliveryLocation;
}

export interface GetAccountOrderResponseOrderItemDelivery {
  method: GetAccountOrderResponseOrderItemDeliveryMethod;
  to: GetAccountOrderResponseOrderItemDeliveryTo;
  expectedAt: number;
  status: string;
  trackTraceCode: string;
  trackTraceUrl: string;
}

export interface GetAccountOrderResponseOrderItem {
  sku: string;
  type: string;
  image: string;
  label: string;
  brand: string;
  mpn: string;
  gtin: string[];
  url: string;
  quantity: number;
  pricing: GetAccountOrderResponseOrderItemPricing;
  delivery: GetAccountOrderResponseOrderItemDelivery;
}

export interface GetAccountOrderResponseOrder {
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
  billingAddress: CoreAddress & {
    id: string;
  };
  fees: {
    shipping: CoreFee[];
    payment: CoreFee[];
  };
  paymentMethod: GetAccountOrderResponseOrderPaymentMethod;
  vat: CoreVatAmount[];
  adjustments: CoreAdjustment[];
  payments: GetAccountOrderResponseOrderPayment[];
  invoices: GetAccountOrderResponseOrderInvoice[];
  items: GetAccountOrderResponseOrderItem[];
  metaData: Record<string, unknown>;
}

export interface GetAccountOrderResponse {
  account: {
    order: GetAccountOrderResponseOrder;
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
