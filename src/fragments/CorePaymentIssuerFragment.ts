import { gql } from '@afosto/graphql-client';

export interface CorePaymentIssuer {
  id: string;
  label: string;
}

export const CorePaymentIssuerFragment = gql`
  fragment CorePaymentIssuerFragment on PaymentIssuer {
    id
    label
  }
`;
