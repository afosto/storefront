import Cookies from 'js-cookie';
import { createGraphQLClient } from '@afosto/graphql-client';
import {
  addCouponToCartMutation,
  addItemsToCartMutation,
  approveStockUpdateSubscriptionMutation,
  changePasswordMutation,
  confirmCartMutation,
  createAccountRmaItemsMutation,
  createAccountRmaMutation,
  createAccountRmaWithItemsMutation,
  createCartMutation,
  createStockUpdateSubscriptionMutation,
  deleteAccountRmaItemsMutation,
  deleteAccountRmaMutation,
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
  updateAccountRmaItemsMutation,
  updateAccountRmaMutation,
  verifyUserMutation,
} from './mutations';
import { signOutOfOrganisationMutation } from './mutations/signOutOfOrganisationMutation';
import { updateContactRoleInOrganisationMutation } from './mutations/updateContactRoleInOrganisationMutation';
import { updateOrganisationOnAccountMutation } from './mutations/updateOrganisationOnAccountMutation';
import {
  getAccountInformationQuery,
  getAccountOrderQuery,
  getAccountOrdersQuery,
  getAccountOrganisationUsersQuery,
  getAccountProjectsQuery,
  getAccountRmaQuery,
  getAccountRmasQuery,
  getCartQuery,
  getChannelQuery,
  getOrderQuery,
  searchAccountRmaItemsQuery,
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
  AccountProjectsResponse,
  AccountRma,
  AccountRmasResponse,
  ApproveStockUpdateSubscriptionResponse,
  CartIntent,
  CartItemIds,
  CartItemsInput,
  CartResponse,
  CartToken,
  ChangePasswordInput,
  ChannelId,
  ChannelResponse,
  ConfirmCartInput,
  CreateAccountRmaInput,
  CreateAccountRmaItemsInput,
  CreateCartInput,
  CreateStockUpdateSubscriptionInput,
  CreateStockUpdateSubscriptionResponse,
  DecodedUserToken,
  DeleteAccountRmaItemsInput,
  GetAccountOrdersQuery,
  GetAccountRmasQuery,
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
  SearchAccountRmaItemsQuery,
  SearchAccountRmaItemsResponse,
  SignInAsOrganisationInput,
  SignInInput,
  SignUpInput,
  StorefrontClientOptions,
  UpdateAccountInformationInput,
  UpdateAccountRmaInput,
  UpdateAccountRmaItemsInput,
  UpdateOrganisationOnAccountInput,
  UpdateUserRoleInAccountOrganisationInput,
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
    cartTokenCookieOptions: {},
    userTokenCookieOptions: {},
    ...(options || {}),
  };
  const cartTokenCookieOptions = {
    path: '/',
    secure: true,
    ...(config.domain ? { domain: config.domain } : {}),
    ...config.cartTokenCookieOptions,
  };

  const userTokenCookieOptions = {
    expires: 1,
    path: '/',
    secure: true,
    ...(config.domain ? { domain: config.domain } : {}),
    ...config.userTokenCookieOptions,
  };
  let sessionID: OptionalString = config.autoGenerateSessionID ? uuid() : null;
  let storedCartToken: OptionalString = null;
  let storedUserToken: OptionalString = null;

  if (!isDefined(config?.storefrontToken)) {
    throw new Error('The Afosto storefront client requires a storefront token.');
  }

  if (
    config.storeCartToken &&
    !['localStorage', 'sessionStorage', 'cookie'].includes(config.cartTokenStorageType)
  ) {
    throw new Error(
      'Invalid storage type provided. Must be one of type: localStorage, sessionStorage or cookie.',
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

      const storagePath = `${storageKeyPrefix}${STOREFRONT_CART_TOKEN_STORAGE_NAME}`;

      if (cartTokenStorageType === 'cookie') {
        return Cookies.get(storagePath) || null;
      }

      const storage = cartTokenStorageType === 'sessionStorage' ? sessionStorage : localStorage;
      return storage.getItem(storagePath);
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

      const storagePath = `${storageKeyPrefix}${STOREFRONT_CART_TOKEN_STORAGE_NAME}`;

      if (cartTokenStorageType === 'cookie') {
        Cookies.remove(storagePath, cartTokenCookieOptions);
        storedCartToken = null;
        return;
      }

      const storage = cartTokenStorageType === 'sessionStorage' ? sessionStorage : localStorage;
      storage.removeItem(storagePath);

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

      const storagePath = `${storageKeyPrefix}${STOREFRONT_CART_TOKEN_STORAGE_NAME}`;

      if (cartTokenStorageType === 'cookie') {
        Cookies.set(storagePath, token, cartTokenCookieOptions);
        storedCartToken = token;
        return;
      }

      const storage = cartTokenStorageType === 'sessionStorage' ? sessionStorage : localStorage;
      storage.setItem(storagePath, token);
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
  const confirmCart = async (
    cartToken?: CartToken,
    input?: ConfirmCartInput,
  ): Promise<CartResponse> => {
    try {
      const currentCartToken = cartToken || storedCartToken;
      const { checkout } = input || {};
      const { successReturnUrl, failureReturnUrl } = checkout || {};

      if (!currentCartToken) {
        return Promise.reject(new Error('No cart token provided'));
      }

      const response = await request(confirmCartMutation, {
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
    items: CartItemsInput[],
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
   * Sign out of an organisation to go back to the users account
   */
  const signOutOfOrganisation = async (): Promise<User | null> => {
    const response = await authenticatedRequest(signOutOfOrganisationMutation);
    const { token } = response?.logOutAsOrganisation || {};

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
        contact_role: role,
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
              role: role?.toLowerCase() || 'user',
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
          role: user?.role?.toUpperCase() || 'USER',
        },
      },
    });

    return { users: response?.addContactToAccountOrganisation?.organisation?.sharedContacts || [] };
  };

  /**
   * Update the role of a user in an organisation
   */
  const updateUserRoleInAccountOrganisation = async (
    input: UpdateUserRoleInAccountOrganisationInput,
  ): Promise<{ users: AccountOrganisationUser[] }> => {
    const { organisationId, userId, role } = input || {};
    const response = await authenticatedRequest(updateContactRoleInOrganisationMutation, {
      updateContactRoleInOrganisationInput: {
        organisationId,
        contactId: userId,
        role: role?.toUpperCase(),
      },
    });

    return { users: response?.updateContactRoleInOrganisation?.organisation?.sharedContacts || [] };
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
  const getAccountOrders = async (
    query: GetAccountOrdersQuery = {},
  ): Promise<AccountOrdersResponse> => {
    const response = await authenticatedRequest(getAccountOrdersQuery, {
      first: query?.first,
      after: query?.after,
    });
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
      updateOrganisationOnAccountInput: input || {},
    });

    return response?.updateOrganisationOnAccount?.account || null;
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

  /**
   * Get the projects for the user that is logged in.
   */
  const getAccountProjects = async (): Promise<AccountProjectsResponse> => {
    const response = await authenticatedRequest(getAccountProjectsQuery);
    const projects = response?.account?.projects || {};

    return {
      projects,
    };
  };

  /**
   * Create a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const createAccountRma = async (
    input: CreateAccountRmaInput = {},
  ): Promise<AccountRma | null> => {
    const { id, items = [], ...otherInput } = input || {};

    if (items.length > 0) {
      const rmaId = id ?? uuid();
      const response = await authenticatedRequest(createAccountRmaWithItemsMutation, {
        input: {
          ...otherInput,
          id: rmaId,
        },
        itemsInput: {
          rmaId,
          items,
        },
      });
      return response?.createRmaItems?.rma || null;
    }

    const response = await authenticatedRequest(createAccountRmaMutation, {
      input: {
        ...otherInput,
        id,
      },
    });
    return response?.createRma?.rma || null;
  };

  /**
   * Delete a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const deleteAccountRma = async (id: string): Promise<boolean> => {
    const response = await authenticatedRequest(deleteAccountRmaMutation, {
      input: {
        id,
      },
    });
    return response?.deleteRma?.isSuccessful || false;
  };

  /**
   * Get the Return Merchandise Authorizations (RMAs) for the user that is logged in.
   */
  const getAccountRmas = async (query: GetAccountRmasQuery = {}): Promise<AccountRmasResponse> => {
    const response = await authenticatedRequest(getAccountRmasQuery, {
      ...(query ?? {}),
      filters: query?.filters ?? {},
    });
    const rmasResponse = response?.rmas || {};
    const rmas = rmasResponse.nodes || [];
    const pageInfo = rmasResponse.pageInfo || {};

    return {
      rmas,
      pageInfo,
    };
  };

  /**
   * Get a Return Merchandise Authorization (RMA) by ID for the user that is logged in.
   */
  const getAccountRma = async (id: string): Promise<AccountRma | null> => {
    const response = await authenticatedRequest(getAccountRmaQuery, {
      id,
    });
    return response?.rma || null;
  };

  /**
   * Update a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const updateAccountRma = async (input: UpdateAccountRmaInput): Promise<AccountRma | null> => {
    const response = await authenticatedRequest(updateAccountRmaMutation, {
      input: input || {},
    });

    return response?.updateRma?.rma || null;
  };

  /**
   * Create items for a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const createAccountRmaItems = async (
    input: CreateAccountRmaItemsInput,
  ): Promise<AccountRma | null> => {
    const response = await authenticatedRequest(createAccountRmaItemsMutation, {
      input: input || {},
    });
    return response?.createRmaItems?.rma || null;
  };

  /**
   * Delete items of a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const deleteAccountRmaItems = async (
    input: DeleteAccountRmaItemsInput,
  ): Promise<AccountRma | null> => {
    const response = await authenticatedRequest(deleteAccountRmaItemsMutation, {
      input: input || {},
    });
    return response?.deleteRmaItems?.rma || null;
  };

  /**
   * Search for available items that can be added to a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const searchAccountRmaItems = async (
    query: SearchAccountRmaItemsQuery = {},
  ): Promise<SearchAccountRmaItemsResponse> => {
    const response = await authenticatedRequest(searchAccountRmaItemsQuery, {
      ...(query ?? {}),
      filters: query?.filters ?? {},
    });
    const searchRmaItemsResponse = response?.searchRmaItems || {};
    const items = searchRmaItemsResponse.nodes || [];
    const pageInfo = searchRmaItemsResponse.pageInfo || {};

    return {
      items,
      pageInfo,
    };
  };

  /**
   * Update items for a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const updateAccountRmaItems = async (
    input: UpdateAccountRmaItemsInput,
  ): Promise<AccountRma | null> => {
    const response = await authenticatedRequest(updateAccountRmaItemsMutation, {
      input: input || {},
    });
    return response?.updateRmaItems?.rma || null;
  };

  initializeCartTokenFromStorage();
  initializeUserToken();

  return {
    addCartItems,
    addCouponToCart,
    approveStockUpdateSubscription,
    changePassword,
    confirmCart,
    createAccountRma,
    createAccountRmaItems,
    createCart,
    createStockUpdateSubscription,
    deleteAccountRma,
    deleteAccountRmaItems,
    getAccountInformation,
    getAccountOrder,
    getAccountOrders,
    getAccountOrganisationUsers,
    getAccountProjects,
    getAccountRma,
    getAccountRmas,
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
    searchAccountRmaItems,
    setCountryCodeForCart,
    setSessionID,
    signIn,
    signInAsOrganisation,
    signOut,
    signOutOfOrganisation,
    signUp,
    storeCartTokenInStorage,
    updateAccountInformation,
    updateAccountRma,
    updateAccountRmaItems,
    updateOrganisationOnAccount,
    updateUserRoleInAccountOrganisation,
    validateUserToken,
    verifyUser,
  };
};
