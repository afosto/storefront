import { gql } from '@afosto/graphql-client';

const CoreVatAmountFragment = gql`
  fragment CoreVatAmountFragment on VatAmount {
    rate
    amount
  }
`;

export default CoreVatAmountFragment;
