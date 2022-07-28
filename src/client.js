import { GraphQLClient } from '@afosto/graphql-client';
import {
  addItemToCartMutation,
  confirmCartMutation,
  createCartMutation,
  removeItemsFromCartMutation,
  updateItemInCartMutation,
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
    let currentCartToken = cartToken || storedCartToken;

    if (!currentCartToken) {
      return Promise.reject(new Error('No cart token provided'));
    }

    const response = await request(confirmCartMutation, {
      confirmCartInput: {
        cartId: currentCartToken,
      },
    });
    return response?.confirmCart?.order || null;
  };

  /**
   * Create a cart
   * @returns {object}
   */
  const createCart = async () => {
    const response = await request(createCartMutation, {
      cartInput: {},
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
  const getCart = async (cartToken = storedCartToken) => {
    if (!cartToken) {
      return null;
    }

    const response = await request(getCartQuery, {
      id: cartToken,
    });
    return response?.cart || null;
  };

  /**
   * Add an item to the cart
   * @param {object} item
   * @param {string=} cartToken
   * @returns {object}
   */
  const addCartItem = async (item, cartToken) => {
    let currentCartToken = cartToken || storedCartToken;

    if (!currentCartToken && config.autoCreateCart === true) {
      const createdCart = await createCart();
      currentCartToken = createdCart.id;
    }

    const response = await request(addItemToCartMutation, {
      addItemToCartInput: {
        cartId: currentCartToken,
        item,
      },
    });
    return response?.addItemToCart?.cart || null;
  };

  /**
   * Update an item in the cart.
   * @param {object} item
   * @param {string=} cartToken
   * @returns {object}
   */
  const updateCartItem = async (item, cartToken = storedCartToken) => {
    if (!cartToken) {
      return Promise.reject(new Error('No cart token provided'));
    }

    const { id, quantity, price, shipment } = item || {};
    const response = await request(updateItemInCartMutation, {
      updateItemInCartInput: {
        cartId: cartToken,
        id,
        price,
        quantity,
        shipment,
      },
    });
    return response?.updateItemInCart?.cart || null;
  };

  /**
   * Remove items from cart
   * @param {array} ids
   * @param {string=} cartToken
   * @returns {object}
   */
  const removeCartItems = async (ids, cartToken = storedCartToken) => {
    if (!cartToken) {
      return Promise.reject(new Error('No cart token provided'));
    }

    if (!isDefined(ids) || ids.length === 0) {
      return Promise.reject(new Error('Provide at least one cart item id'));
    }

    const response = await request(removeItemsFromCartMutation, {
      removeItemsFromCartInput: {
        cartId: cartToken,
        ids,
      },
    });
    return response?.removeItemsFromCart?.cart || null;
  };

  initializeCartTokenFromStorage();

  return {
    addCartItem,
    confirmCart,
    createCart,
    getCart,
    getCartTokenFromStorage,
    query: request,
    removeCartItems,
    removeCartTokenFromStorage,
    updateCartItem,
  };
};

export default Client;
