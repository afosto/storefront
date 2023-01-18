import { gql } from '@afosto/graphql-client';

const CorePaymentMethodSummaryFragment = gql`
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

export default CorePaymentMethodSummaryFragment;
