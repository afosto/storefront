import { GraphQLClient } from '@afosto/graphql-client';
import {
  addItemsToCartMutation,
  confirmCartMutation,
  createCartMutation,
  removeItemsFromCartMutation,
} from './mutations';
import { getCartQuery } from './queries';
import isDefined from './utils/isDefined';
import { DEFAULT_STORAGE_KEY_PREFIX, DEFAULT_STORAGE_TYPE } from './constants';

/**
 * Afosto storefront client
 * @param {object} options
 * @returns {object}
 * @constructor
 */
const Client = options => {
  const config = {
    autoCreateCart: true,
    storeCartToken: true,
    storageKeyPrefix: DEFAULT_STORAGE_KEY_PREFIX,
    storageType: DEFAULT_STORAGE_TYPE,
    ...(options || {}),
  };
  let sessionID = null;
  let storedCartToken;

  if (!isDefined(config?.storefrontToken)) {
    throw new Error('The Afosto storefront client requires a storefront token.');
  }

  if (
    config.storeCartToken === true &&
    !['localStorage', 'sessionStorage'].includes(config.storageType)
  ) {
    throw new Error(
      'Invalid storage type provided. Must be one of type: localStorage or sessionStorage.',
    );
  }

  if (!(typeof window !== 'undefined' && typeof Storage !== 'undefined') && config.storeCartToken) {
    config.storeCartToken = false;
  }

  const gqlClient = new GraphQLClient();
  gqlClient.setAuthorizationHeader(config.storefrontToken);

  /**
   * Get cart token from storage if storage enabled in the configuration
   */
  const getCartTokenFromStorage = () => {
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
    } catch (error) {}
  };

  /**
   * Remove cart token from storage if storage enabled in the configuration
   */
  const removeCartTokenFromStorage = () => {
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
  const storeCartTokenInStorage = token => {
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
  const initializeCartTokenFromStorage = () => {
    try {
      storedCartToken = getCartTokenFromStorage();
    } catch (error) {}
  };

  /**
   * Check for cart mutations whether the stored cart token is still valid.
   * @private
   * @param {object} error
   * @param {function} callback
   * @returns {Promise}
   */
  const checkStoredCartTokenStillValid = async (error, callback) => {
    const { errors } = error?.response || {};
    const cartNotFound = (errors || []).some(error => error.extensions?.status === 404);

    if (cartNotFound) {
      removeCartTokenFromStorage();
      return callback();
    }
  };

  /**
   * Return the session ID used for the storefront.
   * @returns {string|null}
   */
  const getSessionID = () => sessionID;

  /**
   * Set the session ID used for the storefront.
   * @param {String|null} id
   */
  const setSessionID = id => {
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
  const request = async (query, variables = {}, options = {}) =>
    gqlClient.request(query, variables, options);

  /**
   * Confirm the cart and create an order
   * @returns {object}
   */
  const confirmCart = async cartToken => {
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
    } catch (error) {
      if (config.autoCreateCart && storedCartToken && !cartToken) {
        return checkStoredCartTokenStillValid(error, async () => Promise.reject(error));
      }

      return Promise.reject(error);
    }
  };

  /**
   * Create a cart
   * @returns {object}
   */
  const createCart = async () => {
    const response = await request(createCartMutation, {
      cartInput: {
        sessionId: sessionID,
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
   * @returns {Object}
   */
  const getCart = async cartToken => {
    try {
      const currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken) {
        return null;
      }

      const response = await request(getCartQuery, {
        id: currentCartToken,
      });
      return response?.cart || null;
    } catch (error) {
      if (config.autoCreateCart && storedCartToken && !cartToken) {
        return checkStoredCartTokenStillValid(error, async () => null);
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
  const addCartItems = async (items, cartToken) => {
    try {
      let currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken && config.autoCreateCart === true) {
        const createdCart = await createCart();
        currentCartToken = createdCart.id;
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
        return checkStoredCartTokenStillValid(error, async () => addCartItems(items));
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
  const removeCartItems = async (ids, cartToken) => {
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
        return checkStoredCartTokenStillValid(error, async () => Promise.reject(error));
      }

      return Promise.reject(error);
    }
  };

  initializeCartTokenFromStorage();

  return {
    addCartItems,
    confirmCart,
    createCart,
    getCart,
    getCartTokenFromStorage,
    getSessionID,
    setSessionID,
    query: request,
    removeCartItems,
    removeCartTokenFromStorage,
    storeCartTokenInStorage,
  };
};

export default Client;
