export type OptionalString = string | null;

export type CartIntent = null | 'BEGIN_CHECKOUT' | 'VIEW_CART';

export type CartToken = OptionalString;

export type CartItemIds = Array<string>;

export interface Address {
  id: string;
  countryCode?: string;
  administrativeArea?: string;
  locality?: string;
  dependentLocality?: string;
  postalCode?: string;
  sortingCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  thoroughfare?: string;
  premiseNumber?: number;
  premiseNumberSuffix?: string;
  organisation?: string;
  givenName?: string;
  additionalName?: string;
  familyName?: string;
  options?: {
    format?: {
      address?: string;
    };
  };
  isValid?: boolean;
  errors?: string[];
}

export interface Location {
  id: string;
  name: string;
  address: Address;
}

export interface PickupPoint {
  id: string;
  name: string;
  carrier: string;
  address: Address;
}

export interface PhoneNumber {
  id?: string;
  countryCode: string;
  national: string;
  number: string;
}

export interface Registration {
  id?: string;
  countryCode: string;
  number: string;
}

export interface Contact {
  id: string;
  number: string;
  email: string;
  givenName: string;
  additionalName?: string;
  familyName: string;
  phoneNumbers?: {
    primary?: PhoneNumber;
  };
}

export interface AccountOrganisationUser {
  isAdmin: boolean;
  contact: Contact;
}

export interface Organisation {
  id: string;
  type: string;
  avatar?: string;
  cocNumber?: string;
  createdAt?: number;
  updatedAt?: number;
  name: string;
  number?: string;
  administration?: {
    email?: string;
  };
  addressing?: {
    billing?: {
      primary?: Address;
      secondary?: Address[];
    };
    shipping?: {
      primary?: Address;
      secondary?: Address[];
    };
  };
  phoneNumbers?: {
    primary?: PhoneNumber;
    secondary?: PhoneNumber[];
  };
  registration?: Registration;
  sharedContacts?: AccountOrganisationUser[];
}

export interface Account {
  email: string;
  givenName: string;
  additionalName?: string;
  familyName: string;
  createdAt?: number;
  updatedAt?: number;
  billing: Address[];
  sharedOrganisations: Organisation[];
  shipping: Address[];
  organisations: Organisation[];
  phoneNumbers: PhoneNumber[];
}

export enum Carriers {
  afosto = 'AFOSTO',
  bpost = 'BPOST',
  budbee = 'BUDBEE',
  cycloon = 'CYCLOON',
  dgo = 'DGO',
  dhl = 'DHL',
  dhlExpress = 'DHL_EXPRESS',
  dpd = 'DPD',
  fedex = 'FEDEX',
  gls = 'GLS',
  glsNl = 'GLS_NL',
  postnl = 'POSTNL',
  sendcloud = 'SENDCLOUD',
  ups = 'UPS',
}

export type CarrierKey = keyof typeof Carriers;

export interface Cart {
  id: string;
  [key: string]: any;
}

export interface Channel {
  id: string;
  [key: string]: any;
}

export interface DeliveryMethod {
  id: string;
  carrier: Carriers;
  name: string;
  description?: string;
  instruction?: string;
}

export enum DeliveryStatus {
  announced = 'ANNOUNCED',
  delivered = 'DELIVERED',
  inTransit = 'IN_TRANSIT',
  open = 'OPEN',
  readyToCollect = 'READY_TO_COLLECT',
}

export type DeliveryStatusKeys = keyof typeof DeliveryStatus;

export interface AccountOrderItemDelivery {
  type: string;
  method?: DeliveryMethod;
  expectedAt?: number;
  status?: DeliveryStatus;
  trackTraceCode?: string;
  trackTraceUrl?: string;
  to?: {
    address?: Address;
    pickupPoint?: PickupPoint;
    location?: Location;
  };
}

export interface AccountOrderItemPricing {
  amount: number;
}

export interface AccountOrderItem {
  sku: string;
  type: string;
  image: string;
  label: string;
  brand: string;
  mpn: string;
  gtin: string[];
  url: string;
  quantity: number;
  delivery?: AccountOrderItemDelivery;
  pricing?: AccountOrderItemPricing;
}

export interface Adjustment {
  id: string;
  amount: number;
  description: string;
  isDiscount: boolean;
  isPercentage: boolean;
  outcome: {
    amount: number;
  };
}

export interface Fee {
  id: string;
  description: string;
  total: number;
  isContra: boolean;
}

export enum PaymentStatus {
  cancelled = 'CANCELLED',
  expired = 'EXPIRED',
  paid = 'PAID',
  pending = 'PENDING',
}

export type PaymentStatusKeys = keyof typeof PaymentStatus;

export interface PaymentDetails {
  amountPaid: number;
  currency: string;
  isRefund: boolean;
  paidAt: number;
  type: string;
  status: PaymentStatus;
}

export interface Payment {
  id: string;
  amount: number;
  type: string;
  details: PaymentDetails;
}

export enum PaymentMethodCodes {
  afterpay = 'AFTERPAY',
  alipay = 'ALIPAY',
  applePay = 'APPLE_PAY',
  bacsDirectDebit = 'BACS_DIRECT_DEBIT',
  bankTransfer = 'BANK_TRANSFER',
  billink = 'BILLINK',
  card = 'CARD',
  carteBleue = 'CARTE_BLEUE',
  cash = 'CASH',
  cod = 'COD',
  epsUberweisung = 'EPS_UBERWEISUNG',
  fashioncheque = 'FASHIONCHEQUE',
  giropay = 'GIROPAY',
  givacard = 'GIVACARD',
  ideal = 'IDEAL',
  in3 = 'IN3',
  klarna = 'KLARNA',
  klarnaNow = 'KLARNA_NOW',
  klarnaOverTime = 'KLARNA_OVER_TIME',
  manualCard = 'MANUAL_CARD',
  manualGiftCard = 'MANUAL_GIFT_CARD',
  mistercashBancontact = 'MISTERCASH_BANCONTACT',
  multibanco = 'MULTIBANCO',
  onAccount = 'ON_ACCOUNT',
  payconiq = 'PAYCONIQ',
  paypal = 'PAYPAL',
  paypalExpress = 'PAYPAL_EXPRESS',
  paysafecard = 'PAYSAFECARD',
  pin = 'PIN',
  podiumcadeaukaart = 'PODIUMCADEAUKAART',
  postepay = 'POSTEPAY',
  przelewy24 = 'PRZELEWY24',
  sofort = 'SOFORT',
  spraypay = 'SPAYPAY',
  vvvCadeaukaart = 'VVV_CADEAUKAART',
  walley = 'WALLEY',
  webshopgiftcard = 'WEBSHOPGIFTCARD',
  wechatPay = 'WECHAT_PAY',
  yourgift = 'YOURGIFT',
}

export type PaymentMethodCodeKey = keyof typeof PaymentMethodCodes;

export interface PaymentMethod {
  id: string;
  code: PaymentMethodCodes;
  name: string;
  description: string;
  instruction: string;
}

export interface Vat {
  rate: number;
  amount: number;
}

export interface AccountInvoice {
  id: string;
  createdAt: number;
  number: string;
  pdfUrl?: string;
  total: number;
}

export enum AccountOrderProcessing {
  invoice = 'INVOICE',
  cover = 'COVER',
}

export type AccountOrderProcessKey = keyof typeof AccountOrderProcessing;

export interface AccountOrder {
  id: string;
  number: string;
  createdAt: number;
  updatedAt: number;
  isCancelled: boolean;
  isIncludingVat: boolean;
  isVatShifted: boolean;
  subtotal: number;
  total: number;
  totalExcludingVat: number;
  currency: string;
  adjustments: Adjustment[];
  billingAddress?: Address;
  processing: AccountOrderProcessing[];
  fees: {
    shipping: Fee[];
    payment: Fee[];
  };
  invoices: AccountInvoice[];
  items: AccountOrderItem[];
  metaData?: object;
  paymentMethod?: PaymentMethod;
  payments: Payment[];
  vat: Vat[];
}

export interface AccountOrdersResponseOrderItem
  extends Pick<
    AccountOrderItem,
    'sku' | 'type' | 'image' | 'label' | 'brand' | 'mpn' | 'gtin' | 'url' | 'quantity'
  > {
  delivery?: Pick<
    AccountOrderItemDelivery,
    'expectedAt' | 'status' | 'trackTraceCode' | 'trackTraceUrl'
  >;
}

export interface AccountOrdersResponseOrder
  extends Pick<AccountOrder, 'id' | 'number' | 'createdAt' | 'updatedAt'> {
  items: AccountOrdersResponseOrderItem[];
}

export interface AccountOrdersResponse {
  orders: AccountOrdersResponseOrder[];
  pageInfo: PageInfo;
}

export type CartResponse = Cart | null;

export type ChannelResponse = Channel | null;

export type OrderResponse = object | null;

export interface InviteUserToAccountOrganisationInput {
  organisationId: string;
  user: {
    id?: string;
    email?: string;
    isAdmin: boolean;
  };
}

export interface RemoveUserFromAccountOrganisationInput {
  organisationId: string;
  userId: string;
}

export interface ReorderInput {
  orderId: string;
  cartId?: string;
}

export type CreateStockUpdateSubscriptionResponse = {
  email: string;
  products: {
    sku: string;
    label: string;
    gtin: string[];
    slug: string;
    mpn: string;
    brand: string;
    images: string[];
    filters: {
      key: string;
      value: string;
    }[];
    i18n: {
      locale: string;
      label: string;
      slug: string;
      filters: {
        key: string;
        value: string;
      }[];
    }[];
    prices: {
      id: string;
      sku: string;
      amount: number;
      originalAmount: number;
      scheduled: {
        id: string;
        amount: number;
        originalAmount: number;
        activeAt: number;
        createdAt: number;
      }[];
      vat: {
        rate: number;
        countryCode: string;
        administrativeArea: string;
      }[];
      activeSince: number;
      createdAt: number;
      updatedAt: number;
    }[];
    createdAt: number;
    updatedAt: number;
  }[];
  channel: Channel;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
};

export type ApproveStockUpdateSubscriptionResponse = {
  isSuccessful: boolean;
};

export type RemoveStockUpdateSubscriptionResponse = {
  isSuccessful: boolean;
};

export interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
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
  children?: Array<CartItemChildInput>;
  metaData?: CartItemMetaDataInput;
  parentItemId?: string;
}

export interface ChangePasswordInput {
  newPassword: string;
  password: string;
}

export interface DecodedUserToken {
  sub: string;
  email: string;
  family_name: string;
  given_name: string;
  name: string;
  organisation_id?: string;
  organisation_name?: string;
}

export interface RequestPasswordResetInput {
  email: string;
}

export interface RequestUserVerificationInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface SignInAsOrganisationInput {
  organisationId: string;
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

export interface UpdateAccountInformationInput {
  email?: string;
  givenName?: string;
  additionalName?: string;
  familyName?: string;
  billing?: AddressingInput[];
  shipping?: AddressingInput[];
  phoneNumber?: PhoneNumberInput[];
}

export interface User {
  id: string;
  email: string;
  familyName: string;
  givenName: string;
  name: string;
  organisation: {
    id: string;
    name: string;
  } | null;
}

export interface VerifyUserInput {
  token: string;
}

export interface CreateStockUpdateSubscriptionInput {
  channelId?: string;
  email: string;
  sku: string;
}

export type ChannelId = OptionalString;

export interface StorefrontClientOptions {
  autoCreateCart?: boolean;
  autoGenerateSessionID?: boolean;
  cartTokenStorageType?: 'localStorage' | 'sessionStorage';
  domain?: string;
  graphQLClientOptions?: GraphQLClientOptions;
  storeCartToken?: boolean;
  storeUserToken?: boolean;
  storageKeyPrefix?: string;
  storefrontToken: string;
}
