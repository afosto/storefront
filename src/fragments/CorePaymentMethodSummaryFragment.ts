import { gql } from '@afosto/graphql-client';

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
