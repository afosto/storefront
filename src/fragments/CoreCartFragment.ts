import { gql } from '@afosto/graphql-client';
import { CoreAdjustmentFragment } from './CoreAdjustmentFragment';
import { CoreFeeFragment } from './CoreFeeFragment';
import { CoreVatAmountFragment } from './CoreVatAmountFragment';

export const CoreCartFragment = gql`
  ${CoreAdjustmentFragment}
  ${CoreFeeFragment}
  ${CoreVatAmountFragment}
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
      ...CoreAdjustmentFragment
    }
    checkout {
      url
    }
    coupons {
      code
    }
    customer {
      country_code
    }
    incentives {
      quantity
      product {
        sku
        label
        gtin
        slug
        mpn
        brand
        images
        filters {
          key
          value
        }
      }
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
      adjustments {
        ...CoreAdjustmentFragment
      }
      details {
        ids
        meta_data
        parent_id
        filters {
          key
          value
        }
        pricing {
          amount
        }
      }
      vat {
        ...CoreVatAmountFragment
      }
    }
    fees {
      payment {
        ...CoreFeeFragment
      }
      shipping {
        ...CoreFeeFragment
      }
    }
    delivery {
      address {
        country_code
      }
    }
    vat {
      ...CoreVatAmountFragment
    }
  }
`;
