import { gql } from '@afosto/graphql-client';
import CoreAddressFragment from './CoreAddressFragment';
import CoreAdjustmentFragment from './CoreAdjustmentFragment';
import CoreFeeFragment from './CoreFeeFragment';
import CoreItemFilterFragment from './CoreItemFilterFragment';
import CorePaymentIssuerFragment from './CorePaymentIssuerFragment';
import CorePaymentMethodSummaryFragment from './CorePaymentMethodSummaryFragment';
import CorePhoneNumberFragment from './CorePhoneNumberFragment';
import CoreRegistrationFragment from './CoreRegistrationFragment';
import CoreShippingMethodSummaryFragment from './CoreShippingMethodSummaryFragment';
import CoreVatAmountFragment from './CoreVatAmountFragment';

const CoreOrderFragment = gql`
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
    progress
    subtotal
    total
    total_excluding_vat
    updated_at
    customer {
      notes
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
    }
    phone_number {
      ...CorePhoneNumberFragment
    }
    shipping {
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
    services {
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

export default CoreOrderFragment;
