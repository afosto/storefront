import { gql } from '@afosto/graphql-client';
import { CoreAdjustmentFragment, type CoreAdjustment } from './CoreAdjustmentFragment';
import { CoreFeeFragment, type CoreFee } from './CoreFeeFragment';
import { CoreVatAmountFragment, type CoreVatAmount } from './CoreVatAmountFragment';

export interface CoreCartCoupon {
  code: string;
}

export interface CoreCartCheckout {
  url: string;
}

export interface CoreCartCustomerContact {
  id: string;
}

export interface CoreCartCustomerOrganisation {
  id: string;
}

export interface CoreCartCustomerProject {
  id: string;
  name: string;
  number: string;
}

export interface CoreCartCustomer {
  countryCode: string;
  contact: CoreCartCustomerContact | null;
  organisation: CoreCartCustomerOrganisation | null;
  project: CoreCartCustomerProject | null;
}

export interface CoreCartProductFilter {
  key: string;
  value: string;
}

export interface CoreCartIncentiveProduct {
  sku: string;
  label: string;
  gtin: string;
  slug: string;
  mpn: string;
  brand: string;
  images: string[];
  filters: CoreCartProductFilter[];
}

export interface CoreCartIncentive {
  quantity: number;
  product: CoreCartIncentiveProduct;
}

export interface CoreCartItemPricing {
  amount: number;
}

export interface CoreCartItemDetails {
  ids: string[];
  metaData: string;
  parentId: string;
  filters: CoreCartProductFilter[];
  pricing: CoreCartItemPricing;
}


export interface CoreCartItem {
  ids: string[];
  brand: string;
  image: string;
  url: string;
  gtin: string;
  label: string;
  mpn: string;
  quantity: number;
  sku: string;
  subtotal: number;
  total: number;
  adjustments: CoreAdjustment[];
  details: CoreCartItemDetails[];
  vat: CoreVatAmount;
}

export interface CoreCartDeliveryAddress {
  countryCode: string;
}

export interface CoreCartDelivery {
  address: CoreCartDeliveryAddress;
}

export interface CoreCart {
  id: string;
  createdAt: number;
  currency: string;
  isIncludingVat: boolean;
  isVatShifted: boolean;
  subtotal: number;
  total: number;
  totalExcludingVat: number;
  updatedAt: number;
  adjustments: CoreAdjustment[];
  checkout: CoreCartCheckout;
  coupons: CoreCartCoupon[];
  customer: CoreCartCustomer;
  incentives: CoreCartIncentive[];
  items: CoreCartItem[];
  fees: CoreFee[];
  delivery: CoreCartDelivery;
  vat: CoreVatAmount;
}

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
      contact {
        id
      }
      organisation {
        id
      }
      project {
        id
        name
        number
      }
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
