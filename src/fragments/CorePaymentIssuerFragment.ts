import { gql } from '@afosto/graphql-client';

export const CorePaymentIssuerFragment = gql`
  fragment CorePaymentIssuerFragment on PaymentIssuer {
    id
    label
  }
`;
