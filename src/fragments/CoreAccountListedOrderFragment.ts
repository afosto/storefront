import { gql } from '@afosto/graphql-client';

export interface CoreAccountListedOrderItemDelivery {
  expectedAt: number;
  status: string;
  trackTraceCode: string;
  trackTraceUrl: string;
}

export interface CoreAccountListedOrderItem {
  sku: string;
  type: string;
  image: string;
  label: string;
  brand: string;
  mpn: string;
  gtin: string[];
  url: string;
  quantity: number;
  delivery: CoreAccountListedOrderItemDelivery;
}

export interface CoreAccountListedOrder {
  id: string;
  number: string;
  createdAt: number;
  updatedAt: number;
  items: CoreAccountListedOrderItem[];
}

export const CoreAccountListedOrderFragment = gql`
  fragment CoreAccountListedOrderFragment on MyAccountListedOrder {
    id
    number
    created_at
    updated_at
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
      delivery {
        expected_at
        status
        track_trace_code
        track_trace_url
      }
    }
  }
`;
