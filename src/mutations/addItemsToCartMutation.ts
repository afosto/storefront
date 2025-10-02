import { gql } from '@afosto/graphql-client';
import { CoreCartFragment, type CoreCart } from '../fragments/CoreCartFragment';

export interface AddItemsToCartInputItemMetaData {
  [key: string]: any;
};

export type AddItemsToCartInputItemDeliveryType = 'SHIP' | 'COLLECT';

export interface AddItemsToCartInputItemDeliveryFrom {
  id: string;
  type: 'ADDRESS' | 'SERVICE_POINT' | 'LOCATION';
}

export interface AddItemsToCartInputItemDelivery {
  type?: AddItemsToCartInputItemDeliveryType;
  shippingMethod?: string;
  addressId?: string;
  expectedAt?: number;
  windowStartAt?: number;
  windowEndAt?: number;
  from?: AddItemsToCartInputItemDeliveryFrom;
}

export interface AddItemsToCartInputItemChild {
  sku: string;
  quantity: number;
  delivery?: AddItemsToCartInputItemDelivery;
  price?: number;
  metaData?: AddItemsToCartInputItemMetaData;
}


export interface AddItemsToCartInputItem {
  sku: string;
  quantity: number;
  label?: string;
  brand?: string;
  mpn?: string;
  gtin?: string[];
  url?: string;
  image?: string;
  hsCode?: string;
  countryOfOrigin?: string;
  delivery?: AddItemsToCartInputItemDelivery;
  price?: number;
  children?: AddItemsToCartInputItemChild[];
  metaData?: AddItemsToCartInputItemMetaData;
  parentItemId?: string;
  expectedAt?: number;
}

export interface AddItemsToCartInput {
  addItemsToCartInput: {
    cartId: string;
    items: AddItemsToCartInputItem[];
  };
}

export interface AddItemsToCartResponse {
  addItemsToCart: {
    cart: CoreCart;
  };
}

export const addItemsToCartMutation = gql`
  ${CoreCartFragment}
  mutation AddItemsToCart($add_items_to_cart_input: AddItemsToCartInput!) {
    addItemsToCart(input: $add_items_to_cart_input) {
      cart {
        ...CoreCartFragment
      }
    }
  }
`;
