import { gql } from '@afosto/graphql-client';

const CorePaymentIssuerFragment = gql`
  fragment CorePaymentIssuerFragment on PaymentIssuer {
    id
    label
  }
`;

export default CorePaymentIssuerFragment;
