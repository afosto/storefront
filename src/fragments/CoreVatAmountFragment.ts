import { gql } from '@afosto/graphql-client';

export interface CoreVatAmount {
  rate: number;
  amount: number;
}

export const CoreVatAmountFragment = gql`
  fragment CoreVatAmountFragment on VatAmount {
    rate
    amount
  }
`;
