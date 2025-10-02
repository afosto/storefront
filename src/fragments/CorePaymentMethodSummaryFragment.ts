import { gql } from '@afosto/graphql-client';

export interface CorePaymentMethodSummaryPricing {
  fixed: number;
  percentage: number;
}

export interface CorePaymentMethodSummary {
  id: string;
  code: string;
  description: string;
  instruction: string;
  name: string;
  pricing: CorePaymentMethodSummaryPricing;
}

export const CorePaymentMethodSummaryFragment = gql`
  fragment CorePaymentMethodSummaryFragment on PaymentMethodSummary {
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
`;
