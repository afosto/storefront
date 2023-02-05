export type OptionalString = string | null;

export type CartIntent = null | 'BEGIN_CHECKOUT' | 'VIEW_CART';

export type CartToken = OptionalString;

export type CartItemIds = Array<string>;

export interface Cart {
    id: string;
    [key: string]: any,
}

export type CartResponse = Promise<Cart|null>;

export type OrderResponse = Promise<object|null>;

export interface GraphQLClientOptions {
    convertResponseToCamelCase?: boolean;
    convertVariablesToSnakeCase?: boolean;
    excludeConversionKeys?: Array<string>;
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

export interface CartItemShipmentInput {
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
    shipment?: CartItemShipmentInput;
    price?: number;
    metaData?: CartItemMetaDataInput;
}

export interface CartItemsInput {
    sku: string;
    quantity: number;
    shipment?: CartItemShipmentInput;
    price?: number;
    children?: Array<CartItemChildInput>
    metaData?: CartItemMetaDataInput;
    parentItemId?: string;
}

export interface StorefrontClient {
    addCartItems(items: CartItemsInput, cartToken?: CartToken): CartResponse;
    confirmCart(cartToken?: CartToken): CartResponse;
    createCart(input?: CreateCartInput): CartResponse;
    getCart(cartToken?: CartToken, intent?: CartIntent): CartResponse;
    getCartTokenFromStorage(): OptionalString;
    getOrder(id: string): OrderResponse;
    getSessionID(): OptionalString;
    query(query: string, variables?: object, options?: object): Promise<any>;
    removeCartItems(ids: CartItemIds, cartToken?: CartToken): CartResponse;
    removeCartTokenFromStorage(): void;
    setCountryCodeOnCart(countryCode: string, cartToken?: CartToken): CartResponse;
    setSessionID(id: OptionalString): void;
    storeCartTokenInStorage(token: string): void;
}

export interface StorefrontClientOptions {
    autoCreateCart?: boolean;
    graphQLClientOptions?: GraphQLClientOptions;
    storeCartToken?: boolean;
    storageKeyPrefix?: string;
    storageType?: 'localStorage' | 'sessionStorage';
    storefrontToken: string,
}
