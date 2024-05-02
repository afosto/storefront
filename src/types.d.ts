export type OptionalString = string | null;

export type CartIntent = null | 'BEGIN_CHECKOUT' | 'VIEW_CART';

export type CartToken = OptionalString;

export type CartItemIds = Array<string>;

export interface Cart {
    id: string;
    [key: string]: any;
}

export interface Channel {
    id: string;
    [key: string]: any;
}

export interface UserOrderItemDelivery {
  expectedAt?: number;
  status?: string;
  trackTraceCode?: string;
  trackTraceUrl?: string;
}

export interface UserOrderItem {
  sku: string;
  type: string;
  image?: string;
  label?: string;
  brand?: string;
  mpn?: string;
  gtin?: string[];
  url?: string;
  quantity: number;
  delivery?: UserOrderItemDelivery;
}

export interface UserOrder {
  id: string;
  number: string;
  createdAt: number;
  updatedAt: number;
  items: UserOrderItem[];
}

export type CartResponse = Cart | null;

export type ChannelResponse = Channel | null;

export type OrderResponse = object | null;

export interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface UserOrdersResponse {
  orders: UserOrder[];
  pageInfo: PageInfo;
}

export interface GraphQLClientOptions {
    convertResponseToCamelCase?: boolean;
    convertVariablesToSnakeCase?: boolean;
    excludeConversionKeys?: Array<string>;
    stopPaths?: Array<string>;
    [key: string]: any;
}

export interface GraphQLExtensions {
    status?: number;
    [key: string]: any;
}

export interface GraphQLError {
    extensions?: GraphQLExtensions;
    message?: OptionalString;
    path?: Array<string>;
    [key: string]: any;
}

export interface GraphQLResponse {
    data?: object | null;
    errors?: Array<GraphQLError>;
    extensions?: GraphQLExtensions;
    [key: string]: any;
}

export interface GraphQLClientError extends Error {
    response: GraphQLResponse;
}

export interface AddressInput {
    countryCode: string;
    administrativeArea?: string;
    locality: string;
    dependentLocality?: string;
    postalCode: string;
    sortingCode?: string;
    addressLine1: string;
    addressLine2?: string;
    thoroughfare: string;
    premiseNumber: number;
    premiseNumberSuffix?: string;
    organisation?: string;
    givenName?: string;
    additionalName?: string;
    familyName?: string;
}

export interface AddressingInput {
    billing?: AddressInput;
    shipping?: AddressInput;
}

export interface PhoneNumberInput {
    countryCode: string;
    number: string;
}

export interface ContactInput {
    id?: string;
    email: string;
    password?: string;
    isGuest: boolean;
    givenName: string;
    additionalName?: string;
    familyName: string;
    addressing?: AddressingInput;
    phoneNumber?: PhoneNumberInput;
    channelId?: string;
}

export interface AdministrationInput {
    email: string;
}

export interface RegistrationInput {
    countryCode: string;
    number: string;
}

export interface OrganisationInput {
    id?: string;
    name: string;
    isGuest: boolean;
    administration: AdministrationInput;
    addressing?: AddressingInput;
    phoneNumber?: PhoneNumberInput;
    registration?: RegistrationInput;
    cocNumber?: string;
    channelId?: string;
}

export interface CustomerInput {
    contact?: ContactInput;
    organisation?: OrganisationInput;
}

export interface CreateCartInput {
    id?: string;
    customer?: CustomerInput;
    coupons?: Array<string>;
    channelId?: string;
    countryCode?: string;
    currency?: string;
    sessionId?: string;
    successReturnUrl?: string;
    failureReturnUrl?: string;
}

export interface CartItemDeliveryInput {
    shippingMethod?: string;
    addressId?: string;
    expectedAt?: number;
    windowStartAt?: number;
    windowEndAt?: number;
}

export interface CartItemMetaDataInput {
    [key: string]: any;
}

export interface CartItemChildInput {
    sku: string;
    quantity: number;
    delivery?: CartItemDeliveryInput;
    price?: number;
    metaData?: CartItemMetaDataInput;
}

export interface CartItemsInput {
    sku: string;
    quantity: number;
    delivery?: CartItemDeliveryInput;
    price?: number;
    children?: Array<CartItemChildInput>
    metaData?: CartItemMetaDataInput;
    parentItemId?: string;
}

export interface DecodedUserToken {
  sub: string;
  email: string;
  family_name: string;
  given_name: string;
  name: string;
}

export interface RequestPasswordResetInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  givenName: string;
  additionalName?: string;
  familyName: string;
  email: string;
  password: string;
  addressing?: AddressingInput;
  phoneNumber?: PhoneNumberInput;
}

export interface User {
  id: string;
  email: string;
  familyName: string;
  givenName: string;
  name: string;
}

export interface VerifyUserInput {
  token: string;
}

export type ChannelId = OptionalString;

export interface StorefrontClientOptions {
  autoCreateCart?: boolean;
  autoGenerateSessionID?: boolean;
  cartTokenStorageType?: 'localStorage' | 'sessionStorage';
  graphQLClientOptions?: GraphQLClientOptions;
  storeCartToken?: boolean;
  storeUserToken?: boolean;
  storageKeyPrefix?: string;
  storefrontToken: string;
}
