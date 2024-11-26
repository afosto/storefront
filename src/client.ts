import Cookies from 'js-cookie';
import { createGraphQLClient } from '@afosto/graphql-client';
import {
  addCouponToCartMutation,
  addItemsToCartMutation,
  approveStockUpdateSubscriptionMutation,
  changePasswordMutation,
  confirmCartMutation,
  createCartMutation,
  createStockUpdateSubscriptionMutation,
  inviteUserToAccountOrganisationMutation,
  removeCouponFromCartMutation,
  removeItemsFromCartMutation,
  removeStockUpdateSubscriptionMutation,
  removeUserFromAccountOrganisationMutation,
  reorderMutation,
  requestPasswordResetMutation,
  requestUserVerificationMutation,
  resetPasswordMutation,
  setCountryCodeForCartMutation,
  signInAsOrganisationMutation,
  signInMutation,
  signUpMutation,
  updateAccountInformationMutation,
  verifyUserMutation,
} from './mutations';
import { updateOrganisationOnAccountMutation } from './mutations/updateOrganisationOnAccountMutation';
import {
  getAccountInformationQuery,
  getAccountOrderQuery,
  getAccountOrdersQuery,
  getAccountOrganisationUsersQuery,
  getCartQuery,
  getChannelQuery,
  getOrderQuery,
} from './queries';
import { isDefined, parseJwt, uuid } from './utils';
import {
  STOREFRONT_STORAGE_KEY_PREFIX,
  STOREFRONT_CART_TOKEN_STORAGE_TYPE,
  STOREFRONT_CART_TOKEN_STORAGE_NAME,
  STOREFRONT_USER_TOKEN_COOKIE_NAME,
} from './constants';
import {
  Account,
  AccountOrder,
  AccountOrdersResponse,
  AccountOrganisationUser,
  ApproveStockUpdateSubscriptionResponse,
  CartIntent,
  CartItemIds,
  CartItemsInput,
  CartResponse,
  CartToken,
  ChangePasswordInput,
  ChannelId,
  ChannelResponse,
  CreateCartInput,
  CreateStockUpdateSubscriptionInput,
  CreateStockUpdateSubscriptionResponse,
  DecodedUserToken,
  GraphQLClientError,
  InviteUserToAccountOrganisationInput,
  OptionalString,
  OrderResponse,
  Organisation,
  RemoveStockUpdateSubscriptionResponse,
  RemoveUserFromAccountOrganisationInput,
  ReorderInput,
  RequestPasswordResetInput,
  RequestUserVerificationInput,
  ResetPasswordInput,
  SignInAsOrganisationInput,
  SignInInput,
  SignUpInput,
  StorefrontClientOptions,
  UpdateAccountInformationInput,
  UpdateOrganisationOnAccountInput,
  User,
  VerifyUserInput,
} from './types';

export const createStorefrontClient = (options: StorefrontClientOptions) => {
  const config = {
    autoCreateCart: true,
    autoGenerateSessionID: true,
    graphQLClientOptions: {},
    storeCartToken: true,
    storeUserToken: true,
    storageKeyPrefix: STOREFRONT_STORAGE_KEY_PREFIX,
    cartTokenStorageType: STOREFRONT_CART_TOKEN_STORAGE_TYPE,
    ...(options || {}),
  };
  const userTokenCookieOptions = {
    expires: 1,
    path: '/',
    secure: true,
    ...(config.domain ? { domain: config.domain } : {}),
  };
  let sessionID: OptionalString = config.autoGenerateSessionID ? uuid() : null;
  let storedCartToken: OptionalString = null;
  let storedUserToken: OptionalString = null;

  if (!isDefined(config?.storefrontToken)) {
    throw new Error('The Afosto storefront client requires a storefront token.');
  }

  if (
    config.storeCartToken &&
    !['localStorage', 'sessionStorage'].includes(config.cartTokenStorageType)
  ) {
    throw new Error(
      'Invalid storage type provided. Must be one of type: localStorage or sessionStorage.',
    );
  }

  if (!(typeof window !== 'undefined' && typeof Storage !== 'undefined') && config.storeCartToken) {
    config.storeCartToken = false;
  }

  const gqlClient = createGraphQLClient(config.graphQLClientOptions);

  /**
   * Get cart token from storage if storage enabled in the configuration
   */
  const getCartTokenFromStorage = (): OptionalString => {
    try {
      const {
        storeCartToken,
        storageKeyPrefix = STOREFRONT_STORAGE_KEY_PREFIX,
        cartTokenStorageType = STOREFRONT_CART_TOKEN_STORAGE_TYPE,
      } = config || {};

      if (!storeCartToken) {
        return null;
      }

      const storage = cartTokenStorageType === 'sessionStorage' ? sessionStorage : localStorage;
      return storage.getItem(`${storageKeyPrefix}${STOREFRONT_CART_TOKEN_STORAGE_NAME}`);
    } catch (error) {
      return null;
    }
  };

  /**
   * Remove cart token from storage if storage enabled in the configuration
   */
  const removeCartTokenFromStorage = () => {
    try {
      const {
        storeCartToken,
        storageKeyPrefix = STOREFRONT_STORAGE_KEY_PREFIX,
        cartTokenStorageType = STOREFRONT_CART_TOKEN_STORAGE_TYPE,
      } = config || {};

      if (!storeCartToken) {
        return;
      }

      const storage = cartTokenStorageType === 'sessionStorage' ? sessionStorage : localStorage;
      storage.removeItem(`${storageKeyPrefix}${STOREFRONT_CART_TOKEN_STORAGE_NAME}`);

      storedCartToken = null;
    } catch (error) {}
  };

  /**
   * Store the cart token in storage if storage enabled in the configuration.
   * @param {string} token The cart token
   */
  const storeCartTokenInStorage = (token: string) => {
    try {
      const {
        storeCartToken,
        storageKeyPrefix = STOREFRONT_STORAGE_KEY_PREFIX,
        cartTokenStorageType = STOREFRONT_CART_TOKEN_STORAGE_TYPE,
      } = config || {};

      if (!storeCartToken) {
        return;
      }

      const storage = cartTokenStorageType === 'sessionStorage' ? sessionStorage : localStorage;
      storage.setItem(`${storageKeyPrefix}${STOREFRONT_CART_TOKEN_STORAGE_NAME}`, token);
      storedCartToken = token;
    } catch (error) {}
  };

  /**
   * Initialize cart token from storage.
   */
  const initializeCartTokenFromStorage = () => {
    storedCartToken = getCartTokenFromStorage();
  };

  /**
   * Check for cart mutations whether the stored cart token is still valid.
   * @private
   */
  const checkStoredCartTokenStillValid = async (
    error: GraphQLClientError,
    callback: Function,
  ): Promise<any> => {
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
   * Initialize the user token.
   */
  const initializeUserToken = () => {
    const { storageKeyPrefix = STOREFRONT_STORAGE_KEY_PREFIX, storeUserToken } = config || {};

    if (!storeUserToken) {
      removeUserToken();
      return;
    }

    const token = Cookies.get(`${storageKeyPrefix}${STOREFRONT_USER_TOKEN_COOKIE_NAME}`);

    if (token && validateUserToken(token)) {
      storedUserToken = token;
    } else if (token) {
      removeUserToken();
    }
  };

  /**
   * Decode the user token.
   */
  const decodeUserToken = (token: string) => {
    return parseJwt(token);
  };

  /**
   * Return the user token.
   */
  const getUserToken = (): string | null => {
    return storedUserToken;
  };

  /**
   * Remove the user token.
   */
  const removeUserToken = () => {
    const { storageKeyPrefix = STOREFRONT_STORAGE_KEY_PREFIX, storeUserToken } = config || {};

    storedUserToken = null;

    if (storeUserToken) {
      Cookies.remove(
        `${storageKeyPrefix}${STOREFRONT_USER_TOKEN_COOKIE_NAME}`,
        userTokenCookieOptions,
      );
    }
  };

  /**
   * Store the user token.
   */
  const storeUserToken = (token: string) => {
    const { storageKeyPrefix = STOREFRONT_STORAGE_KEY_PREFIX, storeUserToken } = config || {};

    storedUserToken = token;

    if (storeUserToken) {
      Cookies.set(
        `${storageKeyPrefix}${STOREFRONT_USER_TOKEN_COOKIE_NAME}`,
        token,
        userTokenCookieOptions,
      );
    }
  };

  /**
   * Validate the user token.
   */
  const validateUserToken = (token: string) => {
    const decodedToken = decodeUserToken(token);

    if (!decodedToken) {
      return false;
    }

    const { exp, sub } = decodedToken || {};
    const currentTime = Date.now() / 1000;
    const isExpired = !exp || exp < currentTime;

    return sub && !isExpired;
  };

  /**
   * Return the session ID used for server side tracking in the storefront.
   */
  const getSessionID = (): OptionalString => sessionID;

  /**
   * Set the session ID used for server side tracking in the storefront.
   */
  const setSessionID = (id: OptionalString) => {
    sessionID = isDefined(id) ? id : null;
  };

  /**
   * Send an authenticated graphQL request with the user token.
   */
  const authenticatedRequest = async (
    gqlQuery: string,
    variables: object = {},
    options: object = {},
  ): Promise<any> =>
    gqlClient.request(gqlQuery, variables, {
      authorization: `Bearer ${storedUserToken || ''}`,
      ...options,
    });

  /**
   * Send a graphQL request.
   */
  const request = async (
    gqlQuery: string,
    variables: object = {},
    options: object = {},
  ): Promise<any> =>
    gqlClient.request(gqlQuery, variables, {
      authorization: `Bearer ${config.storefrontToken || ''}`,
      ...options,
    });

  /**
   * Confirm the cart and create an order
   */
  const confirmCart = async (cartToken?: CartToken): Promise<CartResponse> => {
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
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () =>
          Promise.reject(error),
        );
      }

      return Promise.reject(error);
    }
  };

  /**
   * Create a cart
   */
  const createCart = async (input: CreateCartInput = {}): Promise<CartResponse> => {
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
   */
  const getCart = async (cartToken?: CartToken, intent?: CartIntent): Promise<CartResponse> => {
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
   */
  const addCartItems = async (
    items: CartItemsInput,
    cartToken?: CartToken,
  ): Promise<CartResponse> => {
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
        return checkStoredCartTokenStillValid(
          error as GraphQLClientError,
          async (cartNotFound: boolean) => {
            if (cartNotFound) {
              return addCartItems(items);
            }

            return Promise.reject(error);
          },
        );
      }

      return Promise.reject(error);
    }
  };

  /**
   * Remove items from cart
   */
  const removeCartItems = async (
    ids: CartItemIds,
    cartToken?: CartToken,
  ): Promise<CartResponse> => {
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
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () =>
          Promise.reject(error),
        );
      }

      return Promise.reject(error);
    }
  };

  /**
   * Set the country code of the customer for a cart
   */
  const setCountryCodeForCart = async (
    countryCode: string,
    cartToken?: CartToken,
  ): Promise<CartResponse> => {
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
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () =>
          Promise.reject(error),
        );
      }

      return Promise.reject(error);
    }
  };

  /**
   * Add coupon code to the cart
   */
  const addCouponToCart = async (coupon: string, cartToken?: CartToken): Promise<CartResponse> => {
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
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () =>
          Promise.reject(error),
        );
      }

      return Promise.reject(error);
    }
  };

  /**
   * Remove coupon code from cart
   */
  const removeCouponFromCart = async (
    coupon: string,
    cartToken?: CartToken,
  ): Promise<CartResponse> => {
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
        return checkStoredCartTokenStillValid(error as GraphQLClientError, async () =>
          Promise.reject(error),
        );
      }

      return Promise.reject(error);
    }
  };

  /**
   * Change your password.
   */
  const changePassword = async (input: ChangePasswordInput): Promise<boolean> => {
    const { newPassword, password } = input || {};
    const response = await authenticatedRequest(changePasswordMutation, {
      changePasswordInput: {
        password,
        newPassword,
      },
    });

    return !!response?.account?.email;
  };

  /**
   * Request a password reset.
   */
  const requestPasswordReset = async (input: RequestPasswordResetInput): Promise<boolean> => {
    const { email } = input || {};
    const response = await request(requestPasswordResetMutation, {
      requestPasswordResetInput: {
        email,
      },
    });

    return response?.requestCustomerPasswordReset?.isSuccessful || false;
  };

  /**
   * Request an user verification.
   */
  const requestUserVerification = async (input: RequestUserVerificationInput): Promise<boolean> => {
    const { email } = input || {};
    const response = await request(requestUserVerificationMutation, {
      requestUserVerificationInput: {
        email,
      },
    });

    return response?.requestCustomerVerificationLink?.isSuccessful || false;
  };

  /**
   * Reset your password.
   */
  const resetPassword = async (input: ResetPasswordInput): Promise<boolean> => {
    const { token, password } = input || {};
    const response = await request(resetPasswordMutation, {
      resetPasswordInput: {
        token,
        password,
      },
    });

    return response?.resetCustomerPassword?.isSuccessful || false;
  };

  /**
   * Sign in
   */
  const signIn = async (input: SignInInput): Promise<User | null> => {
    const { email, password } = input || {};
    const response = await request(signInMutation, {
      signInInput: {
        email,
        password,
      },
    });
    const { token } = response?.logInCustomer || {};

    if (!token || !validateUserToken(token)) {
      return Promise.reject('Invalid user token');
    }

    storeUserToken(token);

    return getUser();
  };

  /**
   * Sign in as organisation
   * Requires a default signIn first
   */
  const signInAsOrganisation = async (input: SignInAsOrganisationInput): Promise<User | null> => {
    const { organisationId } = input || {};
    const response = await authenticatedRequest(signInAsOrganisationMutation, {
      signInAsOrganisationInput: {
        organisationId,
      },
    });
    const { token } = response?.logInAsOrganisation || {};

    if (!token || !validateUserToken(token)) {
      return Promise.reject('Invalid user token');
    }

    storeUserToken(token);

    return getUser();
  };

  /**
   * Sign out
   */
  const signOut = () => {
    removeUserToken();
  };

  /**
   * Sign up
   */
  const signUp = async (input: SignUpInput): Promise<User | null> => {
    const { givenName, additionalName, familyName, email, password, addressing, phoneNumber } =
      input || {};
    const response = await request(signUpMutation, {
      signUpInput: {
        givenName,
        additionalName,
        familyName,
        email,
        password,
        addressing,
        phoneNumber,
      },
    });
    const { token } = response?.registerCustomer || {};

    if (!token || !validateUserToken(token)) {
      return Promise.reject('Invalid user token');
    }

    storeUserToken(token);

    return getUser();
  };

  /**
   * Update the account information of the user that is logged in.
   */
  const updateAccountInformation = async (
    input: UpdateAccountInformationInput,
  ): Promise<Account | null> => {
    const response = await authenticatedRequest(updateAccountInformationMutation, {
      updateAccountInformationInput: input || {},
    });

    return response?.updateAccount?.account || null;
  };

  /**
   * Verify the user.
   */
  const verifyUser = async (input: VerifyUserInput): Promise<User | null> => {
    const { token: verificationToken } = input || {};
    const response = await request(verifyUserMutation, {
      verifyUserInput: {
        token: verificationToken,
      },
    });
    const { token } = response?.verifyCustomer || {};

    if (!token || !validateUserToken(token)) {
      return Promise.reject('Invalid user token');
    }

    storeUserToken(token);

    return getUser();
  };

  /**
   * Get the user that is logged in.
   */
  const getUser = (): User | null => {
    try {
      if (!storedUserToken || !validateUserToken(storedUserToken)) {
        return null;
      }

      const decodedToken = decodeUserToken(storedUserToken) as DecodedUserToken | null;
      const {
        sub: id,
        email,
        family_name: familyName,
        given_name: givenName,
        name,
        organisation_id: organisationId,
        organisation_name: organisationName,
        is_admin: isAdmin,
      } = decodedToken || {};

      if (!id) {
        return null;
      }

      return {
        id,
        email: email || '',
        familyName: familyName || '',
        givenName: givenName || '',
        name: name || '',
        organisation: organisationId
          ? {
              id: organisationId,
              name: organisationName || '',
              role: isAdmin ? 'admin' : 'user',
            }
          : null,
      };
    } catch (error) {
      return null;
    }
  };

  /**
   * Invite a user to get account access to your organisation
   */
  const inviteUserToAccountOrganisation = async (
    input: InviteUserToAccountOrganisationInput,
  ): Promise<{ users: AccountOrganisationUser[] }> => {
    const { organisationId, user } = input || {};
    const response = await authenticatedRequest(inviteUserToAccountOrganisationMutation, {
      inviteUserToAccountOrganisationInput: {
        organisationId,
        contact: {
          contactId: user?.id,
          email: user?.email,
          isAdmin: user?.isAdmin,
        },
      },
    });

    return { users: response?.addContactToAccountOrganisation?.organisation?.sharedContacts || [] };
  };

  /**
   * Remove a user with account access from your organisation
   */
  const removeUserFromAccountOrganisation = async (
    input: RemoveUserFromAccountOrganisationInput,
  ): Promise<{ users: AccountOrganisationUser[] }> => {
    const { organisationId, userId } = input || {};
    const response = await authenticatedRequest(removeUserFromAccountOrganisationMutation, {
      removeUserFromAccountOrganisationInput: {
        organisationId,
        contactId: userId,
      },
    });

    return {
      users: response?.removeContactFromAccountOrganisation?.organisation?.sharedContacts || [],
    };
  };

  /**
   * Get the account information of the user that is logged in.
   */
  const getAccountInformation = async (): Promise<Account | null> => {
    const response = await authenticatedRequest(getAccountInformationQuery);
    return response?.account || null;
  };

  /**
   * Get an order by ID for the user that is logged in.
   */
  const getAccountOrder = async (id: string): Promise<AccountOrder | null> => {
    const response = await authenticatedRequest(getAccountOrderQuery, {
      id,
    });
    return response?.account?.order || null;
  };

  /**
   * Get the orders for the user that is logged in.
   */
  const getAccountOrders = async (): Promise<AccountOrdersResponse> => {
    const response = await authenticatedRequest(getAccountOrdersQuery);
    const ordersResponse = response?.account?.orders || {};
    const orders = ordersResponse.nodes || [];
    const pageInfo = ordersResponse.pageInfo || {};

    return {
      orders,
      pageInfo,
    };
  };

  /**
   * Get the users that have account access to your organisation.
   */
  const getAccountOrganisationUsers = async (): Promise<{ users: AccountOrganisationUser[] }> => {
    const response = await authenticatedRequest(getAccountOrganisationUsersQuery);
    const accountOrganisations: Organisation[] = response?.account?.sharedOrganisations || [];

    const user = getUser();
    const userOrganisationId = user?.organisation?.id;

    if (!userOrganisationId) {
      return { users: [] };
    }

    const organisation = accountOrganisations.find(
      organisation => organisation.id === userOrganisationId,
    );

    return { users: organisation?.sharedContacts || [] };
  };

  /**
   * Update the information of the organisation the user is signed in to.
   */
  const updateOrganisationOnAccount = async (
    input: UpdateOrganisationOnAccountInput,
  ): Promise<Account | null> => {
    const response = await authenticatedRequest(updateOrganisationOnAccountMutation, {
      updateOrganisationOnAccount: input || {},
    });

    return response?.updateAccount?.account || null;
  };

  /**
   * Reorder a previous order of the account by ID
   */
  const reorderAccountOrder = async (input: ReorderInput): Promise<CartResponse> => {
    const response = await authenticatedRequest(reorderMutation, {
      reorderInput: input,
    });
    return response?.reorder?.cart || null;
  };

  /**
   * Get an order by ID
   */
  const getOrder = async (id: string): Promise<OrderResponse> => {
    const response = await request(getOrderQuery, {
      id,
    });
    return response?.order || null;
  };

  /**
   * Get a channel by ID
   */
  const getChannel = async (id: ChannelId): Promise<ChannelResponse> => {
    const response = await request(getChannelQuery, {
      id,
    });
    return response?.channel || null;
  };

  /**
   * Subscribe to stock updates for the given SKU
   */
  const createStockUpdateSubscription = async (
    input: CreateStockUpdateSubscriptionInput,
  ): Promise<CreateStockUpdateSubscriptionResponse> => {
    const response = await request(createStockUpdateSubscriptionMutation, {
      createStockUpdateSubscriptionInput: input,
    });
    return response?.createStockUpdateSubscription || null;
  };

  /**
   * Approve a requested stock update subscription
   */
  const approveStockUpdateSubscription = async (
    token: string,
  ): Promise<ApproveStockUpdateSubscriptionResponse> => {
    const response = await request(approveStockUpdateSubscriptionMutation, {
      approveStockUpdateSubscriptionInput: {
        token,
      },
    });
    return response?.approveStockUpdateSubscription || null;
  };

  /**
   * Unsubscribe from stock updates
   */
  const removeStockUpdateSubscription = async (
    token: string,
  ): Promise<RemoveStockUpdateSubscriptionResponse> => {
    const response = await request(removeStockUpdateSubscriptionMutation, {
      removeStockUpdateSubscriptionInput: {
        token,
      },
    });
    return response?.removeStockUpdateSubscription || null;
  };

  initializeCartTokenFromStorage();
  initializeUserToken();

  return {
    addCartItems,
    addCouponToCart,
    approveStockUpdateSubscription,
    changePassword,
    confirmCart,
    createCart,
    createStockUpdateSubscription,
    getAccountInformation,
    getAccountOrder,
    getAccountOrders,
    getAccountOrganisationUsers,
    getCart,
    getCartTokenFromStorage,
    getChannel,
    getOrder,
    getSessionID,
    getUser,
    getUserToken,
    inviteUserToAccountOrganisation,
    query: request,
    queryAccount: authenticatedRequest,
    removeCartItems,
    removeCartTokenFromStorage,
    removeCouponFromCart,
    removeStockUpdateSubscription,
    removeUserFromAccountOrganisation,
    reorderAccountOrder,
    requestPasswordReset,
    requestUserVerification,
    resetPassword,
    setCountryCodeForCart,
    setSessionID,
    signIn,
    signInAsOrganisation,
    signOut,
    signUp,
    storeCartTokenInStorage,
    updateAccountInformation,
    updateOrganisationOnAccount,
    validateUserToken,
    verifyUser,
  };
};
