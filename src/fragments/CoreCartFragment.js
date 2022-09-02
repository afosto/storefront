import { gql } from '@afosto/graphql-client';

const CoreCartFragment = gql`
  fragment CoreCartFragment on Cart {
    id
    created_at
    currency
    is_including_vat
    is_vat_shifted
    subtotal
    total
    total_excluding_vat
    updated_at
    adjustments {
      id
      amount
      description
      is_discount
      is_percentage
      outcome {
        amount
      }
    }
    checkout {
      url
    }
    coupons {
      code
    }
    items {
      ids
      brand
      image
      url
      gtin
      label
      mpn
      quantity
      sku
      subtotal
      total
      filters {
          key
          values
      }
      adjustments {
        id
        amount
        description
        is_discount
        is_percentage
        outcome {
          amount
        }
      }
      details {
        pricing {
          amount
        }
      }
      vat {
        amount
        rate
      }
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
    vat {
      amount
      rate
    }
  }
`;

export default CoreCartFragment;
