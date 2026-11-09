import { createGraphQLClient } from '@afosto/graphql-client';
import {
  STOREFRONT_STORAGE_KEY_PREFIX,
  STOREFRONT_CART_TOKEN_STORAGE_NAME,
  STOREFRONT_CART_TOKEN_STORAGE_TYPE,
  STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_NAME,
  STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_TYPE,
  STOREFRONT_WISHLIST_TOKEN_STORAGE_NAME,
  STOREFRONT_WISHLIST_TOKEN_STORAGE_TYPE,
} from '../constants';
import type { OptionalString, StorefrontClientOptions } from '../types';
import { isDefined, uuid } from '../utils';
import { createAccountClient } from './account';
import { createAuthClient } from './auth';
import { createCartClient } from './cart';
import { resolveConfig, resolveCookieOptions, withDefault } from './config';
import { type ClientContext, createRequests } from './context';
import { createProductViewingHistoryClient } from './productViewingHistory';
import { createRmaClient } from './rma';
import { createStorefrontDataClient } from './storefront';
import { createTokenStore } from './tokenStore';
import { createUserTokenStore } from './userToken';
import { createWishlistClient } from './wishlist';

export const createStorefrontClient = (options: StorefrontClientOptions) => {
  const config = resolveConfig(options);
  const cookieOptions = resolveCookieOptions(config);
  const storageKeyPrefix = withDefault(config.storageKeyPrefix, STOREFRONT_STORAGE_KEY_PREFIX);

  const cartToken = createTokenStore({
    enabled: config.storeCartToken,
    storageType: withDefault(config.cartTokenStorageType, STOREFRONT_CART_TOKEN_STORAGE_TYPE),
    storagePath: `${storageKeyPrefix}${withDefault(config.cartTokenStorageName, STOREFRONT_CART_TOKEN_STORAGE_NAME)}`,
    cookieOptions: cookieOptions.cart,
    recoverFromNotFound: config.autoCreateCart,
  });

  const wishlistToken = createTokenStore({
    enabled: config.storeWishlistToken,
    storageType: withDefault(
      config.wishlistTokenStorageType,
      STOREFRONT_WISHLIST_TOKEN_STORAGE_TYPE,
    ),
    storagePath: `${storageKeyPrefix}${withDefault(config.wishlistTokenStorageName, STOREFRONT_WISHLIST_TOKEN_STORAGE_NAME)}`,
    cookieOptions: cookieOptions.wishlist,
    recoverFromNotFound: config.autoCreateWishlist,
  });

  const productViewingHistoryToken = createTokenStore({
    enabled: config.storeProductViewingHistoryToken,
    storageType: withDefault(
      config.productViewingHistoryTokenStorageType,
      STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_TYPE,
    ),
    storagePath: `${storageKeyPrefix}${withDefault(config.productViewingHistoryTokenStorageName, STOREFRONT_PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_NAME)}`,
    cookieOptions: cookieOptions.productViewingHistory,
    recoverFromNotFound: config.autoCreateProductViewingHistory,
  });

  const userToken = createUserTokenStore(config, cookieOptions.user);

  let sessionID: OptionalString = null;

  /**
   * Return the session ID used for server side tracking in the storefront.
   */
  const getSessionID = () => {
    if (config.autoGenerateSessionID && sessionID === null) {
      sessionID = uuid();
    }
    return sessionID;
  };

  /**
   * Set the session ID used for server side tracking in the storefront.
   */
  const setSessionID = (id: OptionalString) => {
    sessionID = isDefined(id) ? id : null;
  };

  const { request, authenticatedRequest } = createRequests(
    createGraphQLClient(config.graphQLClientOptions),
    config,
    userToken.getUserToken,
  );

  const context: ClientContext = {
    config,
    request,
    authenticatedRequest,
    cartToken,
    wishlistToken,
    productViewingHistoryToken,
    userToken,
    getSessionID,
  };

  const client = {
    ...createCartClient(context),
    ...createWishlistClient(context),
    ...createProductViewingHistoryClient(context),
    ...createAuthClient(context),
    ...createAccountClient(context),
    ...createRmaClient(context),
    ...createStorefrontDataClient(context),
    getSessionID,
    getUser: userToken.getUser,
    getUserToken: userToken.getUserToken,
    query: request,
    queryAccount: authenticatedRequest,
    setSessionID,
    validateUserToken: userToken.validateUserToken,
  };

  cartToken.initialize();
  wishlistToken.initialize();
  productViewingHistoryToken.initialize();
  userToken.initializeUserToken();

  return client;
};
