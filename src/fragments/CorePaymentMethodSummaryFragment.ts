import { gql } from '@afosto/graphql-client';

export const CorePaymentMethodSummaryFragment = gql`
  fragment CorePaymentMethodSummaryFragment on PaymentMethodSummary {
    id
    name
    description
    instruction
    code
    pricing {
      fixed
      percentage
    }
  }
`;
