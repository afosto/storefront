import { gql } from '@afosto/graphql-client';

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
