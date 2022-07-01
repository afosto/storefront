import { gql } from '@afosto/graphql-client';

const CoreCartFragment = gql`
  fragment CoreCartFragment on Cart {
    id
    total
    subtotal
    total_excluding_vat
    currency
    is_including_vat
    is_vat_shifted
    checkout {
      url
    }
    adjustments {
      id
      amount
      description
      is_percentage
      is_discount
      outcome {
        amount
      }
    }
    items {
      ids
      sku
      quantity
      subtotal
      total
      label
      image
    }
    vat {
      rate
      amount
    }
    services {
      payment {
        description
        total
      }
      shipping {
        description
        total
      }
    }
  }
`;

export default CoreCartFragment;
