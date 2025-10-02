import { gql } from '@afosto/graphql-client';

export interface CoreShippingMethodSummaryPricing {
  fixed: number;
  percentage: number;
}

export interface CoreShippingMethodSummary {
  id: string;
  name: string;
  description: string;
  instruction: string;
  carrier: string;
  pricing: CoreShippingMethodSummaryPricing;
}

export const CoreShippingMethodSummaryFragment = gql`
  fragment CoreShippingMethodSummaryFragment on ShippingMethodSummary {
    id
    name
    description
    instruction
    carrier
    pricing {
      fixed
      percentage
    }
  }
`;
