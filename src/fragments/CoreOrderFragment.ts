import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment, type CoreAddress } from './CoreAddressFragment';
import { CoreAdjustmentFragment, type CoreAdjustment } from './CoreAdjustmentFragment';
import { CoreFeeFragment, type CoreFee } from './CoreFeeFragment';
import { CoreItemFilterFragment, type CoreItemFilter } from './CoreItemFilterFragment';
import { CorePaymentIssuerFragment, type CorePaymentIssuer } from './CorePaymentIssuerFragment';
import { CorePaymentMethodSummaryFragment, type CorePaymentMethodSummary } from './CorePaymentMethodSummaryFragment';
import { CorePhoneNumberFragment, type CorePhoneNumber } from './CorePhoneNumberFragment';
import { CoreRegistrationFragment, type CoreRegistration } from './CoreRegistrationFragment';
import { CoreShippingMethodSummaryFragment, type CoreShippingMethodSummary } from './CoreShippingMethodSummaryFragment';
import { CoreVatAmountFragment, type CoreVatAmount } from './CoreVatAmountFragment';

export type CoreOrderState = 'CONCEPT' | 'OPEN' | 'CLOSED';

export interface CoreOrderCustomerPhoneNumbers {
  primary: CorePhoneNumber;
}

export interface CoreOrderCustomerContact {
  id: string;
  number: string;
  email: string;
  givenName: string;
  additionalName: string;
  familyName: string;
  phoneNumbers: CoreOrderCustomerPhoneNumbers;
}

export type CoreOrderCustomerOrganisationType = 'DEFAULT' | 'SHARED';

export interface CoreOrderCustomerOrganisationAdministration {
  email: string;
}

export interface CoreOrderCustomerOrganisation {
  id: string;
  type: CoreOrderCustomerOrganisationType;
  name: string;
  number: string;
  cocNumber: string;
  administration: CoreOrderCustomerOrganisationAdministration;
  phoneNumbers: CoreOrderCustomerPhoneNumbers;
  registration: CoreRegistration;
}

export interface CoreOrderCustomerProject {
  id: string;
  name: string;
  number: string;
}

export interface CoreOrderCustomer {
  notes: string;
  reference: string;
  contact: CoreOrderCustomerContact | null;
  organisation: CoreOrderCustomerOrganisation | null;
  project: CoreOrderCustomerProject | null;
}

export interface CoreOrderItemPricing {
  amount: number;
}

export interface CoreOrderItemDetails {
  metaData: string;
  parentId: string;
  pricing: CoreOrderItemPricing;
}


export interface CoreOrderItem {
  ids: string[];
  brand: string;
  gtin: string[];
  image: string;
  label: string;
  mpn: string;
  quantity: number;
  sku: string;
  subtotal: number;
  total: number;
  url: string;
  details: CoreOrderItemDetails[];
  filters: CoreItemFilter[];
  vat: CoreVatAmount;
}

export interface CoreOrderDeliveryPickupPoint {
  id: string;
  name: string;
  address: CoreAddress;
}

export interface CoreOrderDelivery {
  address: CoreAddress;
  method: CoreShippingMethodSummary;
  pickupPoint: CoreOrderDeliveryPickupPoint;
}

export interface CoreOrderBillingPayment {
  method: CorePaymentMethodSummary;
  issuer: CorePaymentIssuer;
}

export interface CoreOrderBilling {
  address: CoreAddress;
  payment: CoreOrderBillingPayment;
}

export interface CoreOrderFees {
  shipping: CoreFee[];
  payment: CoreFee[];
}

export interface CoreOrder {
  id: string;
  number: string;
  currency: string;
  createdAt: number;
  updatedAt: number;
  isCancelled: boolean;
  isIncludingVat: boolean;
  isVatShifted: boolean;
  subtotal: number;
  total: number;
  totalExcludingVat: number;
  state: CoreOrderState;
  customer: CoreOrderCustomer;
  items: CoreOrderItem[];
  phoneNumber: CorePhoneNumber;
  delivery: CoreOrderDelivery;
  billing: CoreOrderBilling;
  adjustments: CoreAdjustment[];
  fees: CoreOrderFees;
  vat: CoreVatAmount[];
}

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
