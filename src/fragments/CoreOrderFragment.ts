import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment } from './CoreAddressFragment';
import { CoreAdjustmentFragment } from './CoreAdjustmentFragment';
import { CoreFeeFragment } from './CoreFeeFragment';
import { CoreItemFilterFragment } from './CoreItemFilterFragment';
import { CorePaymentIssuerFragment } from './CorePaymentIssuerFragment';
import { CorePaymentMethodSummaryFragment } from './CorePaymentMethodSummaryFragment';
import { CorePhoneNumberFragment } from './CorePhoneNumberFragment';
import { CoreRegistrationFragment } from './CoreRegistrationFragment';
import { CoreShippingMethodSummaryFragment } from './CoreShippingMethodSummaryFragment';
import { CoreVatAmountFragment } from './CoreVatAmountFragment';

export const CoreOrderFragment = gql`
  ${CoreAddressFragment}
  ${CoreAdjustmentFragment}
  ${CoreFeeFragment}
  ${CoreItemFilterFragment}
  ${CorePaymentIssuerFragment}
  ${CorePaymentMethodSummaryFragment}
  ${CorePhoneNumberFragment}
  ${CoreRegistrationFragment}
  ${CoreShippingMethodSummaryFragment}
  ${CoreVatAmountFragment}
  fragment CoreOrderFragment on Order {
    id
    number
    currency
    created_at
    is_including_vat
    is_vat_shifted
    state: status
    subtotal
    total
    total_excluding_vat
    updated_at
    customer {
      notes
      reference
      contact {
        id
        number
        email
        given_name
        additional_name
        family_name
        phone_numbers {
          primary {
            ...CorePhoneNumberFragment
          }
        }
      }
      organisation {
        id
        type
        name
        number
        coc_number
        administration {
          email
        }
        phone_numbers {
          primary {
            ...CorePhoneNumberFragment
          }
        }
        registration {
          ...CoreRegistrationFragment
        }
      }
      project {
        id
        name
        number
      }
    }
    items {
      ids
      brand
      gtin
      image
      label
      mpn
      quantity
      sku
      subtotal
      total
      url
      details {
        parent_id
        pricing {
          amount
        }
        meta_data
      }
      filters {
        ...CoreItemFilterFragment
      }
      vat {
        ...CoreVatAmountFragment
      }
    }
    phone_number {
      ...CorePhoneNumberFragment
    }
    delivery {
      address {
        ...CoreAddressFragment
      }
      method {
        ...CoreShippingMethodSummaryFragment
      }
      pickup_point {
        id
        name
        address {
          ...CoreAddressFragment
        }
      }
    }
    billing {
      address {
        ...CoreAddressFragment
      }
      payment {
        method {
          ...CorePaymentMethodSummaryFragment
        }
        issuer {
          ...CorePaymentIssuerFragment
        }
      }
    }
    adjustments {
      ...CoreAdjustmentFragment
    }
    fees {
      shipping {
        ...CoreFeeFragment
      }
      payment {
        ...CoreFeeFragment
      }
    }
    vat {
      ...CoreVatAmountFragment
    }
  }
`;
