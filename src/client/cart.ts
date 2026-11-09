import {
  addCouponToCartMutation,
  type AddCouponToCartInput,
  type AddCouponToCartResponse,
  addItemsToCartMutation,
  type AddItemsToCartInput,
  type AddItemsToCartResponse,
  confirmCartMutation,
  type ConfirmCartInput,
  type ConfirmCartResponse,
  createCartMutation,
  type CreateCartInput,
  type CreateCartResponse,
  removeCouponFromCartMutation,
  type RemoveCouponFromCartInput,
  type RemoveCouponFromCartResponse,
  removeItemsFromCartMutation,
  type RemoveItemsFromCartInput,
  type RemoveItemsFromCartResponse,
  setCountryCodeForCartMutation,
  type SetCountryCodeForCartInput,
  type SetCountryCodeForCartResponse,
} from '../mutations';
import { getCartQuery, type GetCartParams, type GetCartResponse } from '../queries';
import type { CartToken } from '../types';
import { isDefined } from '../utils';
import type { ClientContext } from './context';

export const createCartClient = ({
  config,
  request,
  cartToken: store,
  getSessionID,
}: ClientContext) => {
  /**
   * Handle an error of a request that may have used the stored cart token.
   */
  const handleError = <T>(
    error: unknown,
    cartToken: CartToken | undefined,
    callback: (cartNotFound: boolean) => T | Promise<T>,
  ) => store.handleError(error, cartToken, callback);

  const rejectWith = (error: unknown) => async () => Promise.reject(error);

  /**
   * Confirm the cart and create an order
   */
  const confirmCart = async (
    cartToken?: CartToken,
    input?: ConfirmCartInput['confirmCartInput'],
  ) => {
    try {
      const currentCartToken = cartToken || store.token;
      const { checkout } = input || {};
      const { successReturnUrl, failureReturnUrl } = checkout || {};

      if (!currentCartToken) {
        return Promise.reject(new Error('No cart token provided'));
      }

      const response = await request<ConfirmCartResponse, ConfirmCartInput>(confirmCartMutation, {
        confirmCartInput: {
          cartId: currentCartToken,
          checkout: {
            ...(successReturnUrl ? { successReturnUrl } : {}),
            ...(failureReturnUrl ? { failureReturnUrl } : {}),
          },
        },
      });
      return response?.confirmCart?.order || null;
    } catch (error: unknown) {
      return handleError(error, cartToken, rejectWith(error));
    }
  };

  /**
   * Create a cart
   */
  const createCart = async (input: CreateCartInput['cartInput'] = {}) => {
    const response = await request<CreateCartResponse, CreateCartInput>(createCartMutation, {
      cartInput: {
        sessionId: getSessionID() ?? undefined,
        ...input,
      },
    });
    const createdCart = response?.createCart?.cart || null;

    if (createdCart?.id) {
      store.storeInStorage(createdCart?.id);
    }

    return createdCart;
  };

  /**
   * Get a cart by cart token
   */
  const getCart = async (cartToken?: CartToken, intent?: GetCartParams['intent']) => {
    try {
      const currentCartToken = cartToken || store.token;

      if (!currentCartToken) {
        return null;
      }

      const response = await request<GetCartResponse, GetCartParams>(getCartQuery, {
        id: currentCartToken,
        intent,
      });
      return response?.cart || null;
    } catch (error) {
      return handleError(error, cartToken, async () => null);
    }
  };

  /**
   * Create a cart when there is no cart token and auto creating carts is on.
   */
  const getOrCreateCartToken = async (cartToken?: CartToken) => {
    let currentCartToken = cartToken || store.token;

    if (!currentCartToken && config.autoCreateCart) {
      const createdCart = await createCart();

      if (createdCart) {
        currentCartToken = createdCart.id;
      }
    }

    return currentCartToken;
  };

  /**
   * Add items to the cart
   */
  const addCartItems = async (
    items: AddItemsToCartInput['addItemsToCartInput']['items'],
    cartToken?: CartToken,
  ): Promise<AddItemsToCartResponse['addItemsToCart']['cart'] | null> => {
    try {
      const currentCartToken = await getOrCreateCartToken(cartToken);

      const response = await request<AddItemsToCartResponse, AddItemsToCartInput>(
        addItemsToCartMutation,
        {
          addItemsToCartInput: {
            cartId: currentCartToken as string,
            items,
          },
        },
      );

      return response?.addItemsToCart?.cart || null;
    } catch (error) {
      return handleError(error, cartToken, async (cartNotFound: boolean) => {
        if (cartNotFound) {
          return addCartItems(items);
        }

        return Promise.reject(error);
      });
    }
  };

  /**
   * Remove items from cart
   */
  const removeCartItems = async (
    ids: RemoveItemsFromCartInput['removeItemsFromCartInput']['ids'],
    cartToken?: CartToken,
  ) => {
    try {
      const currentCartToken = cartToken || store.token;

      if (!currentCartToken) {
        return Promise.reject(new Error('No cart token provided'));
      }

      if (!isDefined(ids) || ids.length === 0) {
        return Promise.reject(new Error('Provide at least one cart item id'));
      }

      const response = await request<RemoveItemsFromCartResponse, RemoveItemsFromCartInput>(
        removeItemsFromCartMutation,
        {
          removeItemsFromCartInput: {
            cartId: currentCartToken,
            ids,
          },
        },
      );
      return response?.removeItemsFromCart?.cart || null;
    } catch (error) {
      return handleError(error, cartToken, rejectWith(error));
    }
  };

  /**
   * Set the country code of the customer for a cart
   */
  const setCountryCodeForCart = async (
    countryCode: SetCountryCodeForCartInput['setCountryCodeForCartInput']['countryCode'],
    cartToken?: CartToken,
  ) => {
    try {
      const currentCartToken = await getOrCreateCartToken(cartToken);

      if (!isDefined(countryCode)) {
        return Promise.reject(new Error('Provide a country code'));
      }

      const response = await request<SetCountryCodeForCartResponse, SetCountryCodeForCartInput>(
        setCountryCodeForCartMutation,
        {
          setCountryCodeForCartInput: {
            cartId: currentCartToken as string,
            countryCode,
          },
        },
      );
      return response?.setCountryCodeForCart?.cart || null;
    } catch (error) {
      return handleError(error, cartToken, rejectWith(error));
    }
  };

  /**
   * Add coupon code to the cart
   */
  const addCouponToCart = async (
    coupon: AddCouponToCartInput['couponInput']['coupon'],
    cartToken?: CartToken,
  ) => {
    try {
      const currentCartToken = await getOrCreateCartToken(cartToken);

      if (!isDefined(coupon)) {
        return Promise.reject(new Error('Provide a coupon code'));
      }

      const response = await request<AddCouponToCartResponse, AddCouponToCartInput>(
        addCouponToCartMutation,
        {
          couponInput: {
            cartId: currentCartToken as string,
            coupon,
          },
        },
      );

      return response?.addCouponToCart?.cart || null;
    } catch (error) {
      return handleError(error, cartToken, rejectWith(error));
    }
  };

  /**
   * Remove coupon code from cart
   */
  const removeCouponFromCart = async (
    coupon: RemoveCouponFromCartInput['couponInput']['coupon'],
    cartToken?: CartToken,
  ) => {
    try {
      const currentCartToken = cartToken || store.token;

      if (!currentCartToken) {
        return Promise.reject(new Error('No cart token provided'));
      }

      if (!isDefined(coupon)) {
        return Promise.reject(new Error('Provide the coupon code that should be removed'));
      }

      const response = await request<RemoveCouponFromCartResponse, RemoveCouponFromCartInput>(
        removeCouponFromCartMutation,
        {
          couponInput: {
            cartId: currentCartToken as string,
            coupon,
          },
        },
      );
      return response?.removeCouponFromCart?.cart || null;
    } catch (error) {
      return handleError(error, cartToken, rejectWith(error));
    }
  };

  return {
    addCartItems,
    addCouponToCart,
    confirmCart,
    createCart,
    getCart,
    getCartTokenFromStorage: store.readFromStorage,
    removeCartItems,
    removeCartTokenFromStorage: store.removeFromStorage,
    removeCouponFromCart,
    setCountryCodeForCart,
    storeCartTokenInStorage: store.storeInStorage,
  };
};
