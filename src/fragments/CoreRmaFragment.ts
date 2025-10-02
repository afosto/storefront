import { gql } from '@afosto/graphql-client';
import type { CoreAddress } from './CoreAddressFragment';
import type { CoreItemFilter } from './CoreItemFilterFragment';
import type { CorePhoneNumber } from './CorePhoneNumberFragment';

export type CoreRmaStatus = 'CONCEPT' | 'OPEN' | 'CLOSED';

export interface CoreRmaContactPhoneNumbers {
  primary: CorePhoneNumber;
}

export interface CoreRmaContact {
  id: string;
  number: string;
  email: string;
  givenName: string;
  additionalName: string;
  familyName: string;
  phoneNumbers: CoreRmaContactPhoneNumbers;
}

export interface CoreRmaOrganisationAdministration {
  email: string;
}

export interface CoreRmaOrganisationPhoneNumbers {
  primary: CorePhoneNumber;
}

export interface CoreRmaOrganisation {
  id: string;
  number: string;
  name: string;
  administration: CoreRmaOrganisationAdministration;
  phoneNumbers: CoreRmaOrganisationPhoneNumbers;
}

export interface CoreRmaItemProduct {
  sku: string;
  label: string;
  brand: string;
  gtin: string[];
  mpn: string;
  images: string[];
  filters: CoreItemFilter[];
}

export type CoreRmaItemStatus = 'AUTHORIZED' | 'PENDING' | 'REJECTED';

export type CoreRmaItemReason = 'INCORRECT_PRODUCT' | 'UNSUITABLE' | 'DELIVERY_ISSUES' | 'DAMAGED' | 'DEFECTIVE' | 'SIZE_TOO_SMALL' | 'SIZE_TOO_LARGE' | 'IMAGE_DOES_NOT_MATCH' | 'ALLERGIC_REACTION' | 'UNCOMPETITIVE_PRICING' | 'ORDER_ERROR' | 'ORDERED_MULTIPLE_SIZES';

export interface CoreRmaItemOrder {
  id: string;
  number: string;
  currency: string;
}

export interface CoreRmaItem {
  id: string;
  product: CoreRmaItemProduct;
  status: CoreRmaItemStatus;
  isReceived: boolean;
  reason: CoreRmaItemReason;
  order: CoreRmaItemOrder;
  contactNote: string;
  vendorNote: string;
  createdAt: number;
  updatedAt: number;
}

export interface CoreRma {
  id: string;
  number: string;
  status: CoreRmaStatus;
  contact: CoreRmaContact;
  organisation: CoreRmaOrganisation;
  address: CoreAddress;
  items: CoreRmaItem[];
  dueAt: number;
  createdAt: number;
  updatedAt: number;
}

export const CoreRmaFragment = gql`
  fragment CoreRmaFragment on Rma {
    id
    number
    status
    contact {
      id
      number
      email
      given_name
      additional_name
      family_name
      phone_numbers {
        primary {
          id
          country_code
          national
          number
        }
      }
    }
    organisation {
      id
      number
      name
      administration {
        email
      }
      phone_numbers {
        primary {
          id
          country_code
          national
          number
        }
      }
    }
    address {
      country_code
      administrative_area
      locality
      postal_code
      address_line_1
      address_line_2
      thoroughfare
      premise_number
      premise_number_suffix
      given_name
      additional_name
      family_name
      organisation
      options {
        format {
          address
        }
      }
    }
    items {
      id
      product {
        sku
        label
        brand
        gtin
        images
        mpn
        filters {
          key
          value
        }
      }
      status
      is_received
      reason
      order {
        id
        number
        currency
      }
      contact_note
      vendor_note
      created_at
      updated_at
    }
    due_at
    created_at
    updated_at
  }
`;
