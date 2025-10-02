import { gql } from '@afosto/graphql-client';

export interface CoreAdjustment {
  id: string;
  description: string;
  amount: number;
  isDiscount: boolean;
  isPercentage: boolean;
  outcome: {
    amount: number;
  };
}

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
