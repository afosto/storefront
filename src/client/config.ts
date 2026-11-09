import type Cookies from 'js-cookie';
import {
  STOREFRONT_CART_TOKEN_STORAGE_NAME,
  STOREFRONT_CART_TOKEN_STORAGE_TYPE,
  STOREFRONT_PRODUCT_VIEWING_HISTORY_DEFAULT_LABEL,
  STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_EXPIRES_IN_DAYS,
  STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_NAME,
  STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_TYPE,
  STOREFRONT_STORAGE_KEY_PREFIX,
  STOREFRONT_VALID_STORAGE_TYPES,
  STOREFRONT_WISHLIST_DEFAULT_LABEL,
  STOREFRONT_WISHLIST_TOKEN_EXPIRES_IN_DAYS,
  STOREFRONT_WISHLIST_TOKEN_STORAGE_NAME,
  STOREFRONT_WISHLIST_TOKEN_STORAGE_TYPE,
} from '../constants';
import type { StorefrontClientConfig, StorefrontClientOptions } from '../types';
import { isDefined, isStorageTypeAvailable } from '../utils';

/**
 * Merge the options with the defaults, validate them and turn off storing tokens in storage
 * that is not available (for example during server side rendering).
 */
export const resolveConfig = (options: StorefrontClientOptions): StorefrontClientConfig => {
  const config: StorefrontClientConfig = {
    autoCreateCart: true,
    autoGenerateSessionID: true,
    graphQLClientOptions: {},
    storeCartToken: true,
    storeUserToken: true,
    storageKeyPrefix: STOREFRONT_STORAGE_KEY_PREFIX,
    cartTokenStorageName: STOREFRONT_CART_TOKEN_STORAGE_NAME,
    cartTokenStorageType: STOREFRONT_CART_TOKEN_STORAGE_TYPE,
    cartTokenCookieOptions: {},
    autoCreateProductViewingHistory: true,
    storeProductViewingHistoryToken: true,
    productViewingHistoryTokenStorageType: STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_TYPE,
    productViewingHistoryTokenStorageName: STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_NAME,
    productViewingHistoryDefaultLabel: STOREFRONT_PRODUCT_VIEWING_HISTORY_DEFAULT_LABEL,
    productViewingHistoryDefaultExpiresInDays:
      STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_EXPIRES_IN_DAYS,
    productViewingHistoryTokenCookieOptions: {},
    userTokenCookieOptions: {},
    autoCreateWishlist: true,
    storeWishlistToken: true,
    wishlistTokenStorageType: STOREFRONT_WISHLIST_TOKEN_STORAGE_TYPE,
    wishlistTokenStorageName: STOREFRONT_WISHLIST_TOKEN_STORAGE_NAME,
    wishlistDefaultLabel: STOREFRONT_WISHLIST_DEFAULT_LABEL,
    wishlistDefaultExpiresInDays: STOREFRONT_WISHLIST_TOKEN_EXPIRES_IN_DAYS,
    wishlistTokenCookieOptions: {},
    ...options,
  };

  if (!isDefined(config?.storefrontToken)) {
    throw new Error('The Afosto storefront client requires a storefront token.');
  }

  const tokenStorageConfigs = [
    {
      key: 'storeCartToken',
      storageType: config.cartTokenStorageType,
      name: 'cart',
    },
    {
      key: 'storeWishlistToken',
      storageType: config.wishlistTokenStorageType,
      name: 'wishlist',
    },
    {
      key: 'storeProductViewingHistoryToken',
      storageType: config.productViewingHistoryTokenStorageType,
      name: 'product viewing history',
    },
  ] as const;

  for (const { key, storageType, name } of tokenStorageConfigs) {
    if (!config[key]) {
      continue;
    }

    if (!STOREFRONT_VALID_STORAGE_TYPES.includes(storageType)) {
      throw new Error(
        `Invalid storage type provided for the ${name} token. ` +
          `Must be one of: ${STOREFRONT_VALID_STORAGE_TYPES.join(', ')}.`,
      );
    }

    if (!isStorageTypeAvailable(storageType)) {
      config[key] = false;
    }
  }

  return config;
};

/**
 * The cookie options per token: the defaults, then the domain, then the options per token.
 */
export const resolveCookieOptions = (config: StorefrontClientConfig) => {
  const defaultCookieOptions: Cookies.CookieAttributes = {
    path: '/',
    secure: true,
    ...(config.domain ? { domain: config.domain } : {}),
  };

  return {
    cart: { ...defaultCookieOptions, ...config.cartTokenCookieOptions },
    wishlist: { ...defaultCookieOptions, ...config.wishlistTokenCookieOptions },
    productViewingHistory: {
      ...defaultCookieOptions,
      ...config.productViewingHistoryTokenCookieOptions,
    },
    user: { expires: 1, ...defaultCookieOptions, ...config.userTokenCookieOptions },
  };
};

/**
 * `value`, or `fallback` when the option was explicitly set to undefined.
 */
export const withDefault = <T>(value: T | undefined, fallback: T): T =>
  value === undefined ? fallback : value;
