import { gql } from '@afosto/graphql-client';

export interface CoreFee {
  id: string;
  description: string;
  isContra: boolean;
  total: number;
}

export const CoreFeeFragment = gql`
  fragment CoreFeeFragment on Fee {
    id
    description
    is_contra
    total
  }
`;
