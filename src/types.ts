import type { CoreAddress } from './fragments/CoreAddressFragment';
import type { CoreCart } from './fragments/CoreCartFragment';
import type { CoreAccount, CoreAccountOrganisation } from './fragments/CoreAccountFragment';
import type { CoreChannel } from './fragments/CoreChannelFragment';
import type { CoreRma, CoreRmaItem } from './fragments/CoreRmaFragment';
import type { CoreSharedContact } from './fragments/CoreSharedContactFragment';
import type { CoreOrder } from './fragments/CoreOrderFragment';
import type { CoreAccountListedOrder } from './fragments/CoreAccountListedOrderFragment';

export type OptionalString = string | null;

export type Account = CoreAccount;

export type AccountOrdersOrder = CoreAccountListedOrder;

export type AccountOrganisation = CoreAccountOrganisation;

export type AccountOrganisationUser = CoreSharedContact;

export type AccountRma = CoreRma;

export type AccountRmaStatus = 'CONCEPT' | 'OPEN' | 'CLOSED';

export type AccountRmaItem = CoreRmaItem;

export type AccountRmaItemStatus = 'PENDING' | 'AUTHORIZED' | 'REJECTED';

export type AccountSearchRmaItemStatus = 'CONCEPT' | 'OPEN' | 'CLOSED';

export type Address = CoreAddress;

export type Cart = CoreCart;

export type CartToken = OptionalString;

export type Channel = CoreChannel;

export type Order = CoreOrder;

export interface DecodedUserToken {
  sub: string;
  email: string;
  family_name: string;
  given_name: string;
  name: string;
  organisation_id?: string;
  organisation_name?: string;
  contact_role?: string;
}

export type AccountRmaItemReason =
  | 'INCORRECT_PRODUCT'
  | 'UNSUITABLE'
  | 'DELIVERY_ISSUES'
  | 'DAMAGED'
  | 'DEFECTIVE'
  | 'SIZE_TOO_SMALL'
  | 'SIZE_TOO_LARGE'
  | 'IMAGE_DOES_NOT_MATCH'
  | 'ALLERGIC_REACTION'
  | 'UNCOMPETITIVE_PRICING'
  | 'ORDER_ERROR'
  | 'ORDERED_MULTIPLE_SIZES';

export interface User {
  id: string;
  email: string;
  familyName: string;
  givenName: string;
  name: string;
  organisation: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export interface StorefrontClientOptions {
  autoCreateCart?: boolean;
  autoGenerateSessionID?: boolean;
  cartTokenStorageType?: 'localStorage' | 'sessionStorage' | 'cookie';
  cartTokenCookieOptions?: Cookies.CookieAttributes;
  userTokenCookieOptions?: Cookies.CookieAttributes;
  domain?: string;
  graphQLClientOptions?: GraphQLClientOptions;
  storeCartToken?: boolean;
  storeUserToken?: boolean;
  storageKeyPrefix?: string;
  storefrontToken: string;
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
  mondialRelay = 'MONDIAL_RELAY',
  postnl = 'POSTNL',
  sendcloud = 'SENDCLOUD',
  ups = 'UPS',
}

export type CarrierKey = keyof typeof Carriers;

export enum LinkType {
  checkout = 'CHECKOUT',
  privacyAgreement = 'PRIVACY_AGREEMENT',
  termsConditions = 'TERMS_CONDITIONS',
  vendor = 'VENDOR',
  myAccount = 'MY_ACCOUNT',
}

export enum DeliveryStatus {
  announced = 'ANNOUNCED',
  delivered = 'DELIVERED',
  inTransit = 'IN_TRANSIT',
  open = 'OPEN',
  readyToCollect = 'READY_TO_COLLECT',
}

export type DeliveryStatusKeys = keyof typeof DeliveryStatus;

export enum PaymentStatus {
  cancelled = 'CANCELLED',
  expired = 'EXPIRED',
  paid = 'PAID',
  pending = 'PENDING',
}

export type PaymentStatusKeys = keyof typeof PaymentStatus;

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
  giftCard = 'GIFT_CARD',
  giropay = 'GIROPAY',
  givacard = 'GIVACARD',
  googleWallet = 'GOOGLE_WALLET',
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

export type OrganisationType = 'DEFAULT' | 'SHARED';

export type PaymentMethodCodeKey = keyof typeof PaymentMethodCodes;

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
  billing?: AddressInput[];
  shipping?: AddressInput[];
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
  phoneNumber?: PhoneNumberInput[];
  consents?: string[];
  priceListId?: string;
  locale?: string;
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
  type?: OrganisationType;
  isGuest: boolean;
  administration: AdministrationInput;
  addressing?: AddressingInput;
  phoneNumber?: PhoneNumberInput[];
  registration?: RegistrationInput;
  cocNumber?: string;
  priceListId?: string;
  number?: string;
}

export interface CustomerInput {
  contact?: ContactInput;
  contactId?: string;
  organisation?: OrganisationInput;
  organisationId?: string;
  notes?: string;
  reference?: string;
}
