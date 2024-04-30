import { gql } from '@afosto/graphql-client';

export const CoreVatAmountFragment = gql`
  fragment CoreVatAmountFragment on VatAmount {
    rate
    amount
  }
`;
