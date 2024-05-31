import { gql } from '@afosto/graphql-client';

export const CoreAdjustmentFragment = gql`
  fragment CoreAdjustmentFragment on Adjustment {
    id
    description
    amount
    is_discount
    is_percentage
    outcome {
      amount
    }
  }
`;
