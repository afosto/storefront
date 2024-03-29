import { GraphQLClient } from '@afosto/graphql-client';
import {
  addCouponToCartMutation,
  addItemsToCartMutation,
  confirmCartMutation,
  createCartMutation,
  removeCouponFromCartMutation,
  removeItemsFromCartMutation,
  setCountryCodeForCartMutation,
} from './mutations/index.js';
import { getCartQuery, getChannelQuery, getOrderQuery } from './queries/index.js';
import isDefined from './utils/isDefined.js';
import uuid from './utils/uuid.js';
import { DEFAULT_STORAGE_KEY_PREFIX, DEFAULT_STORAGE_TYPE } from './constants.js';
import {
  CartIntent,
  CartItemIds,
  CartItemsInput,
  CartResponse,
  CartToken,
  ChannelId,
  ChannelResponse,
  CreateCartInput,
  GraphQLClientError,
  OptionalString,
  OrderResponse,
  StorefrontClient,
  StorefrontClientOptions,
} from './types.js';

/**
 * Afosto storefront client
 * @param {object} options
 * @returns {object}
 * @constructor
 */
const Client = (options: StorefrontClientOptions): StorefrontClient => {
  const config = {
    autoCreateCart: true,
    autoGenerateSessionID: true,
    graphQLClientOptions: {},
    storeCartToken: true,
    storageKeyPrefix: DEFAULT_STORAGE_KEY_PREFIX,
    storageType: DEFAULT_STORAGE_TYPE,
    ...(options || {}),
  };
  let sessionID: OptionalString = config.autoGenerateSessionID ? uuid() : null;
  let storedCartToken: OptionalString = null;

  if (!isDefined(config?.storefrontToken)) {
    throw new Error('The Afosto storefront client requires a storefront token.');
  }

  if (
    config.storeCartToken &&
    !['localStorage', 'sessionStorage'].includes(config.storageType)
  ) {
    throw new Error(
      'Invalid storage type provided. Must be one of type: localStorage or sessionStorage.',
    );
  }

  if (!(typeof window !== 'undefined' && typeof Storage !== 'undefined') && config.storeCartToken) {
    config.storeCartToken = false;
  }

  const gqlClient = new GraphQLClient(config.graphQLClientOptions);
  gqlClient.setAuthorizationHeader(config.storefrontToken);

  /**
   * Get cart token from storage if storage enabled in the configuration
   */
  const getCartTokenFromStorage = (): OptionalString => {
    try {
      const {
        storeCartToken,
        storageKeyPrefix = DEFAULT_STORAGE_KEY_PREFIX,
        storageType = DEFAULT_STORAGE_TYPE,
      } = config || {};

      if (!storeCartToken) {
        return null;
      }

      const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
      return storage.getItem(`${storageKeyPrefix}.cartToken`);
    } catch (error) {
      return null;
    }
  };

  /**
   * Remove cart token from storage if storage enabled in the configuration
   */
  const removeCartTokenFromStorage = (): void => {
    try {
      const {
        storeCartToken,
        storageKeyPrefix = DEFAULT_STORAGE_KEY_PREFIX,
        storageType = DEFAULT_STORAGE_TYPE,
      } = config || {};

      if (!storeCartToken) {
        return;
      }

      const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
      storage.removeItem(`${storageKeyPrefix}.cartToken`);

      storedCartToken = null;
    } catch (error) {}
  };

  /**
   * Store the cart token in storage if storage enabled in the configuration.
   * @param {string} token The cart token
   */
  const storeCartTokenInStorage = (token: string): void => {
    try {
      const {
        storeCartToken,
        storageKeyPrefix = DEFAULT_STORAGE_KEY_PREFIX,
        storageType = DEFAULT_STORAGE_TYPE,
      } = config || {};

      if (!storeCartToken) {
        return;
      }

      const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
      storage.setItem(`${storageKeyPrefix}.cartToken`, token);
      storedCartToken = token;
    } catch (error) {}
  };

  /**
   * Initialize cart token from storage.
   */
  const initializeCartTokenFromStorage = (): void => {
    storedCartToken = getCartTokenFromStorage();
  };

  /**
   * Check for cart mutations whether the stored cart token is still valid.
   * @private
   * @param {object} error
   * @param {function} callback
   * @returns {Promise}
   */
  const checkStoredCartTokenStillValid = async (error: GraphQLClientError, callback: Function): Promise<any> => {
    const { errors } = error?.response || {};
    const cartNotFound = (errors || []).some(
      responseError => responseError.extensions?.status === 404,
    );

    if (cartNotFound) {
      removeCartTokenFromStorage();
    }

    return callback(cartNotFound);
  };

  /**
   * Return the session ID used for server side tracking in the storefront.
   * @returns {string|null}
   */
  const getSessionID = (): OptionalString => sessionID;

  /**
   * Set the session ID used for server side tracking in the storefront.
   * @param {String|null} id
   */
  const setSessionID = (id: OptionalString): void => {
    sessionID = isDefined(id) ? id : null;
  };

  /**
   * Send a graphQL request.
   *
   * @param {string} query Query/mutation
   * @param {object} variables Query variables
   * @param {object} options Request options
   * @returns {object}
   */
  const request = async (query: string, variables: object = {}, options: object = {}): Promise<any> =>
    gqlClient.request(query, variables, options);

  /**
   * Confirm the cart and create an order
   * @returns {object}
   */
  const confirmCart = async (cartToken?: CartToken): CartResponse => {
    try {
      const currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken) {
        return Promise.reject(new Error('No cart token provided'));
      }

      const response = await request(confirmCartMutation, {
        confirmCartInput: {
          cartId: currentCartToken,
        },
      });
      return response?.confirmCart?.order || null;
    } catch (error: unknown) {
      if (config.autoCreateCart && storedCartToken && !cartToken) {
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () => Promise.reject(error));
      }

      return Promise.reject(error);
    }
  };

  /**
   * Create a cart
   * @param {object=} input
   * @returns {object}
   */
  const createCart = async (input: CreateCartInput = {}): CartResponse => {
    const response = await request(createCartMutation, {
      cartInput: {
        sessionId: sessionID,
        ...input,
      },
    });
    const createdCart = response?.createCart?.cart || null;

    if (createdCart?.id) {
      storeCartTokenInStorage(createdCart?.id);
    }

    return createdCart;
  };

  /**
   * Get a cart by cart token
   * @param {string=} cartToken
   * @param {(null|'BEGIN_CHECKOUT'|'VIEW_CART')=} intent Intent for server side tracking
   * @returns {Object}
   */
  const getCart = async (cartToken?: CartToken, intent?: CartIntent): CartResponse => {
    try {
      const currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken) {
        return null;
      }

      const response = await request(getCartQuery, {
        id: currentCartToken,
        intent,
      });
      return response?.cart || null;
    } catch (error) {
      if (config.autoCreateCart && storedCartToken && !cartToken) {
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () => null);
      }

      return Promise.reject(error);
    }
  };

  /**
   * Add items to the cart
   * @param {array} items
   * @param {string=} cartToken
   * @returns {object}
   */
  const addCartItems = async (items: CartItemsInput, cartToken?: CartToken): CartResponse => {
    try {
      let currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken && config.autoCreateCart) {
        const createdCart = await createCart();

        if (createdCart) {
          currentCartToken = createdCart.id;
        }
      }

      const response = await request(addItemsToCartMutation, {
        addItemsToCartInput: {
          cartId: currentCartToken,
          items,
        },
      });
      return response?.addItemsToCart?.cart || null;
    } catch (error) {
      if (config.autoCreateCart && storedCartToken && !cartToken) {
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async (cartNotFound: boolean) => {
          if (cartNotFound) {
            return addCartItems(items);
          }

          return Promise.reject(error);
        });
      }

      return Promise.reject(error);
    }
  };

  /**
   * Remove items from cart
   * @param {array} ids
   * @param {string=} cartToken
   * @returns {object}
   */
  const removeCartItems = async (ids: CartItemIds, cartToken?: CartToken): CartResponse => {
    try {
      const currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken) {
        return Promise.reject(new Error('No cart token provided'));
      }

      if (!isDefined(ids) || ids.length === 0) {
        return Promise.reject(new Error('Provide at least one cart item id'));
      }

      const response = await request(removeItemsFromCartMutation, {
        removeItemsFromCartInput: {
          cartId: currentCartToken,
          ids,
        },
      });
      return response?.removeItemsFromCart?.cart || null;
    } catch (error) {
      if (config.autoCreateCart && storedCartToken && !cartToken) {
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () => Promise.reject(error));
      }

      return Promise.reject(error);
    }
  };

  /**
   * Set the country code of the customer for a cart
   * @param {string} countryCode
   * @param {string=} cartToken
   * @returns {object}
   */
  const setCountryCodeForCart = async (countryCode: string, cartToken?: CartToken): CartResponse => {
    try {
      let currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken && config.autoCreateCart) {
        const createdCart = await createCart();

        if (createdCart) {
          currentCartToken = createdCart.id;
        }
      }

      if (!isDefined(countryCode)) {
        return Promise.reject(new Error('Provide a country code'));
      }

      const response = await request(setCountryCodeForCartMutation, {
        setCountryCodeForCartInput: {
          cartId: currentCartToken,
          countryCode,
        },
      });
      return response?.setCountryCodeForCart?.cart || null;
    } catch (error) {
      if (config.autoCreateCart && storedCartToken && !cartToken) {
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () => Promise.reject(error));
      }

      return Promise.reject(error);
    }
  };

  /**
   * Add coupon code to the cart
   * @param {string} coupon
   * @param {string=} cartToken
   * @returns {object}
   */
  const addCouponToCart = async (coupon: string, cartToken?: CartToken): CartResponse => {
    try {
      let currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken && config.autoCreateCart) {
        const createdCart = await createCart();

        if (createdCart) {
          currentCartToken = createdCart.id;
        }
      }

      if (!isDefined(coupon)) {
        return Promise.reject(new Error('Provide a coupon code'));
      }

      const response = await request(addCouponToCartMutation, {
        couponInput: {
          cartId: currentCartToken,
          coupon,
        },
      });
      return response?.addCouponToCart?.cart || null;
    } catch (error) {
      if (config.autoCreateCart && storedCartToken && !cartToken) {
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () => Promise.reject(error));
      }

      return Promise.reject(error);
    }
  };

  /**
   * Remove coupon code from cart
   * @param {string} coupon
   * @param {string=} cartToken
   * @returns {object}
   */
  const removeCouponFromCart = async (coupon: string, cartToken?: CartToken): CartResponse => {
    try {
      const currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken) {
        return Promise.reject(new Error('No cart token provided'));
      }

      if (!isDefined(coupon)) {
        return Promise.reject(new Error('Provide the coupon code that should be removed'));
      }

      const response = await request(removeCouponFromCartMutation, {
        couponInput: {
          cartId: currentCartToken,
          coupon,
        },
      });
      return response?.removeCouponFromCart?.cart || null;
    } catch (error) {
      if (config.autoCreateCart && storedCartToken && !cartToken) {
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () => Promise.reject(error));
      }

      return Promise.reject(error);
    }
  };

  /**
   * Get an order by id
   * @param {string} id
   * @returns {Object}
   */
  const getOrder = async (id: string): OrderResponse => {
    const response = await request(getOrderQuery, {
      id,
    });
    return response?.order || null;
  };

  /**
   * Get a channel by id
   * @param {string=} id
   * @returns {Object}
   */
  const getChannel = async (id: ChannelId): ChannelResponse => {
    const response = await request(getChannelQuery, {
      id,
    });
    return response?.channel || null;
  };

  initializeCartTokenFromStorage();

  return {
    addCartItems,
    addCouponToCart,
    confirmCart,
    createCart,
    getCart,
    getCartTokenFromStorage,
    getChannel,
    getOrder,
    getSessionID,
    query: request,
    removeCartItems,
    removeCartTokenFromStorage,
    removeCouponFromCart,
    setCountryCodeForCart,
    setSessionID,
    storeCartTokenInStorage,
  };
};

export default Client;
