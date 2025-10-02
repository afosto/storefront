import Cookies from 'js-cookie';
import { createGraphQLClient } from '@afosto/graphql-client';
import {
  addCouponToCartMutation,
  type AddCouponToCartInput,
  type AddCouponToCartResponse,
  addItemsToCartMutation,
  type AddItemsToCartInput,
  type AddItemsToCartResponse,
  approveStockUpdateSubscriptionMutation,
  type ApproveStockUpdateSubscriptionInput,
  type ApproveStockUpdateSubscriptionResponse,
  changePasswordMutation,
  type ChangePasswordInput,
  type ChangePasswordResponse,
  confirmCartMutation,
  type ConfirmCartInput,
  type ConfirmCartResponse,
  createAccountRmaItemsMutation,
  type CreateAccountRmaItemsInput,
  type CreateAccountRmaItemsResponse,
  createAccountRmaMutation,
  type CreateAccountRmaInput,
  type CreateAccountRmaResponse,
  createAccountRmaWithItemsMutation,
  type CreateAccountRmaWithItemsInput,
  type CreateAccountRmaWithItemsResponse,
  createCartMutation,
  type CreateCartInput,
  type CreateCartResponse,
  createStockUpdateSubscriptionMutation,
  type CreateStockUpdateSubscriptionInput,
  type CreateStockUpdateSubscriptionResponse,
  deleteAccountRmaItemsMutation,
  type DeleteAccountRmaItemsInput,
  type DeleteAccountRmaItemsResponse,
  deleteAccountRmaMutation,
  type DeleteAccountRmaInput,
  type DeleteAccountRmaResponse,
  inviteUserToAccountOrganisationMutation,
  type InviteUserToAccountOrganisationInput,
  type InviteUserToAccountOrganisationResponse,
  removeCouponFromCartMutation,
  type RemoveCouponFromCartInput,
  type RemoveCouponFromCartResponse,
  removeItemsFromCartMutation,
  type RemoveItemsFromCartInput,
  type RemoveItemsFromCartResponse,
  removeStockUpdateSubscriptionMutation,
  type RemoveStockUpdateSubscriptionInput,
  type RemoveStockUpdateSubscriptionResponse,
  removeUserFromAccountOrganisationMutation,
  type RemoveUserFromAccountOrganisationInput,
  type RemoveUserFromAccountOrganisationResponse,
  reorderMutation,
  type ReorderInput,
  type ReorderResponse,
  requestPasswordResetMutation,
  type RequestPasswordResetInput,
  type RequestPasswordResetResponse,
  requestUserVerificationMutation,
  type RequestUserVerificationInput,
  type RequestUserVerificationResponse,
  resetPasswordMutation,
  type ResetPasswordInput,
  type ResetPasswordResponse,
  setCountryCodeForCartMutation,
  type SetCountryCodeForCartInput,
  type SetCountryCodeForCartResponse,
  signInAsOrganisationMutation,
  type SignInAsOrganisationInput,
  type SignInAsOrganisationResponse,
  signInMutation,
  type SignInInput,
  type SignInResponse,
  signOutOfOrganisationMutation,
  type SignOutOfOrganisationResponse,
  signUpMutation,
  type SignUpInput,
  type SignUpResponse,
  updateAccountInformationMutation,
  type UpdateAccountInformationInput,
  type UpdateAccountInformationResponse,
  updateAccountRmaItemsMutation,
  type UpdateAccountRmaItemsInput,
  type UpdateAccountRmaItemsResponse,
  updateAccountRmaMutation,
  type UpdateAccountRmaInput,
  type UpdateAccountRmaResponse,
  updateContactRoleInOrganisationMutation,
  type UpdateContactRoleInOrganisationInput,
  type UpdateContactRoleInOrganisationResponse,
  updateOrganisationOnAccountMutation,
  type UpdateOrganisationOnAccountInput,
  type UpdateOrganisationOnAccountResponse,
  verifyUserMutation,
  type VerifyUserInput,
  type VerifyUserResponse,
} from './mutations';
import {
  getAccountInformationQuery,
  type GetAccountInformationResponse,
  getAccountOrderQuery,
  type GetAccountOrderParams,
  type GetAccountOrderResponse,
  getAccountOrdersQuery,
  type GetAccountOrdersParams,
  type GetAccountOrdersResponse,
  getAccountOrganisationUsersQuery,
  type GetAccountOrganisationUsersResponse,
  getAccountProjectsQuery,
  type GetAccountProjectsResponse,
  getAccountRmaQuery,
  type GetAccountRmaParams,
  type GetAccountRmaResponse,
  getAccountRmasQuery,
  type GetAccountRmasParams,
  type GetAccountRmasResponse,
  getCartQuery,
  type GetCartParams,
  type GetCartResponse,
  getChannelQuery,
  type GetChannelParams,
  type GetChannelResponse,
  getOrderQuery,
  type GetOrderParams,
  type GetOrderResponse,
  searchAccountRmaItemsQuery,
  type SearchAccountRmaItemsParams,
  type SearchAccountRmaItemsResponse,
} from './queries';
import { isDefined, parseJwt, uuid } from './utils';
import {
  STOREFRONT_STORAGE_KEY_PREFIX,
  STOREFRONT_CART_TOKEN_STORAGE_TYPE,
  STOREFRONT_CART_TOKEN_STORAGE_NAME,
  STOREFRONT_USER_TOKEN_COOKIE_NAME,
} from './constants';
import type {
  CartToken,
  DecodedUserToken,
  GraphQLClientError,
  OptionalString,
  StorefrontClientOptions,
  User,
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
    } catch {
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
    } catch {}
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
    } catch {}
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
  const checkStoredCartTokenStillValid = async <T>(
    error: GraphQLClientError,
    callback: (cartNotFound: boolean) => T | Promise<T>,
  ): Promise<T> => {
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
  const authenticatedRequest = async <TResponse, TVariables extends Record<string, any> = Record<string, any>>(
    gqlQuery: string,
    variables?: TVariables,
    options: object = {},
  ): Promise<TResponse> =>
    gqlClient.request(gqlQuery, variables ?? {} as TVariables, {
      authorization: `Bearer ${storedUserToken || ''}`,
      ...options,
    });

  /**
   * Send a graphQL request.
   */
  const request = async <TResponse, TVariables extends Record<string, any> = Record<string, any>>(
    gqlQuery: string,
    variables?: TVariables,
    options: object = {},
  ): Promise<TResponse> =>
    gqlClient.request(gqlQuery, variables ?? {} as TVariables, {
      authorization: `Bearer ${config.storefrontToken || ''}`,
      ...options,
    });

  /**
   * Confirm the cart and create an order
   */
  const confirmCart = async (
    cartToken?: CartToken,
    input?: ConfirmCartInput['confirmCartInput'],
  ) => {
    try {
      const currentCartToken = cartToken || storedCartToken;
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
  const createCart = async (input: CreateCartInput['cartInput'] = {}) => {
    const response = await request<CreateCartResponse, CreateCartInput>(createCartMutation, {
      cartInput: {
        sessionId: sessionID ?? undefined,
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
  const getCart = async (cartToken?: CartToken, intent?: GetCartParams['intent']) => {
    try {
      const currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken) {
        return null;
      }

      const response = await request<GetCartResponse, GetCartParams>(getCartQuery, {
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
    items: AddItemsToCartInput['addItemsToCartInput']['items'],
    cartToken?: CartToken,
  ): Promise<AddItemsToCartResponse['addItemsToCart']['cart'] | null> => {
    try {
      let currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken && config.autoCreateCart) {
        const createdCart = await createCart();

        if (createdCart) {
          currentCartToken = createdCart.id;
        }
      }

      const response = await request<AddItemsToCartResponse, AddItemsToCartInput>(addItemsToCartMutation, {
        addItemsToCartInput: {
          cartId: currentCartToken as string,
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
    ids: RemoveItemsFromCartInput['removeItemsFromCartInput']['ids'],
    cartToken?: CartToken,
  ) => {
    try {
      const currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken) {
        return Promise.reject(new Error('No cart token provided'));
      }

      if (!isDefined(ids) || ids.length === 0) {
        return Promise.reject(new Error('Provide at least one cart item id'));
      }

      const response = await request<RemoveItemsFromCartResponse, RemoveItemsFromCartInput>(removeItemsFromCartMutation, {
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
    countryCode: SetCountryCodeForCartInput['setCountryCodeForCartInput']['countryCode'],
    cartToken?: CartToken,
  ) => {
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

      const response = await request<SetCountryCodeForCartResponse, SetCountryCodeForCartInput>(setCountryCodeForCartMutation, {
        setCountryCodeForCartInput: {
          cartId: currentCartToken as string,
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
  const addCouponToCart = async (coupon: AddCouponToCartInput['couponInput']['coupon'], cartToken?: CartToken) => {
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

      const response = await request<AddCouponToCartResponse, AddCouponToCartInput>(addCouponToCartMutation, {
        couponInput: {
          cartId: currentCartToken as string,
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
    coupon: RemoveCouponFromCartInput['couponInput']['coupon'],
    cartToken?: CartToken,
  ) => {
    try {
      const currentCartToken = cartToken || storedCartToken;

      if (!currentCartToken) {
        return Promise.reject(new Error('No cart token provided'));
      }

      if (!isDefined(coupon)) {
        return Promise.reject(new Error('Provide the coupon code that should be removed'));
      }

      const response = await request<RemoveCouponFromCartResponse, RemoveCouponFromCartInput>(removeCouponFromCartMutation, {
        couponInput: {
          cartId: currentCartToken as string,
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
  const changePassword = async (input: ChangePasswordInput['changePasswordInput']) => {
    const { newPassword, password } = input || {};
    const response = await authenticatedRequest<ChangePasswordResponse, ChangePasswordInput>(changePasswordMutation, {
      changePasswordInput: {
        password,
        newPassword,
      },
    });

    return !!response?.setPasswordForAccount?.account?.email;
  };

  /**
   * Request a password reset.
   */
  const requestPasswordReset = async (input: RequestPasswordResetInput['requestPasswordResetInput']) => {
    const { email } = input || {};
    const response = await request<RequestPasswordResetResponse, RequestPasswordResetInput>(requestPasswordResetMutation, {
      requestPasswordResetInput: {
        email,
      },
    });

    return response?.requestCustomerPasswordReset?.isSuccessful || false;
  };

  /**
   * Request an user verification.
   */
  const requestUserVerification = async (input: RequestUserVerificationInput['requestUserVerificationInput']) => {
    const { email } = input || {};
    const response = await request<RequestUserVerificationResponse, RequestUserVerificationInput>(requestUserVerificationMutation, {
      requestUserVerificationInput: {
        email,
      },
    });

    return response?.requestCustomerVerificationLink?.isSuccessful || false;
  };

  /**
   * Reset your password.
   */
  const resetPassword = async (input: ResetPasswordInput['resetPasswordInput']) => {
    const { token, password } = input || {};
    const response = await request<ResetPasswordResponse, ResetPasswordInput>(resetPasswordMutation, {
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
  const signIn = async (input: SignInInput['signInInput']) => {
    const { email, password } = input || {};
    const response = await request<SignInResponse, SignInInput>(signInMutation, {
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
  const signInAsOrganisation = async (input: SignInAsOrganisationInput['signInAsOrganisationInput']) => {
    const { organisationId } = input || {};
    const response = await authenticatedRequest<SignInAsOrganisationResponse, SignInAsOrganisationInput>(signInAsOrganisationMutation, {
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
  const signOutOfOrganisation = async () => {
    const response = await authenticatedRequest<SignOutOfOrganisationResponse>(signOutOfOrganisationMutation);
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
  const signUp = async (input: SignUpInput['signUpInput']) => {
    const { givenName, additionalName, familyName, email, password, addressing, phoneNumber } =
      input || {};
    const response = await request<SignUpResponse, SignUpInput>(signUpMutation, {
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
    input: UpdateAccountInformationInput['updateAccountInformationInput'],
  ) => {
    const response = await authenticatedRequest<UpdateAccountInformationResponse, UpdateAccountInformationInput>(updateAccountInformationMutation, {
      updateAccountInformationInput: input || {},
    });

    return response?.updateAccount?.account || null;
  };

  /**
   * Verify the user.
   */
  const verifyUser = async (input: VerifyUserInput['verifyUserInput']) => {
    const { token: verificationToken } = input || {};
    const response = await request<VerifyUserResponse, VerifyUserInput>(verifyUserMutation, {
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
    input: Omit<InviteUserToAccountOrganisationInput['inviteUserToAccountOrganisationInput'], 'contact'> & {
      user: {
        id?: InviteUserToAccountOrganisationInput['inviteUserToAccountOrganisationInput']['contact']['contactId'],
        email?: InviteUserToAccountOrganisationInput['inviteUserToAccountOrganisationInput']['contact']['email'],
        role: InviteUserToAccountOrganisationInput['inviteUserToAccountOrganisationInput']['contact']['role'],
      }
    },
  ) => {
    const { organisationId, user } = input || {};

    const response = await authenticatedRequest<InviteUserToAccountOrganisationResponse, InviteUserToAccountOrganisationInput>(inviteUserToAccountOrganisationMutation, {
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
    input: Omit<UpdateContactRoleInOrganisationInput['updateContactRoleInOrganisationInput'], 'contactId'> & {
      userId: UpdateContactRoleInOrganisationInput['updateContactRoleInOrganisationInput']['contactId'],
    },
  ) => {
    const { organisationId, userId, role } = input || {};

    const response = await authenticatedRequest<UpdateContactRoleInOrganisationResponse, UpdateContactRoleInOrganisationInput>(updateContactRoleInOrganisationMutation, {
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
    input: Omit<RemoveUserFromAccountOrganisationInput['removeUserFromAccountOrganisationInput'], 'contactId'> & {
      userId: RemoveUserFromAccountOrganisationInput['removeUserFromAccountOrganisationInput']['contactId'],
    },
  ) => {
    const { organisationId, userId } = input || {};
    const response = await authenticatedRequest<RemoveUserFromAccountOrganisationResponse, RemoveUserFromAccountOrganisationInput>(removeUserFromAccountOrganisationMutation, {
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
  const getAccountInformation = async () => {
    const response = await authenticatedRequest<GetAccountInformationResponse>(getAccountInformationQuery);
    return response?.account || null;
  };

  /**
   * Get an order by ID for the user that is logged in.
   */
  const getAccountOrder = async (id: GetAccountOrderParams['id']) => {
    const response = await authenticatedRequest<GetAccountOrderResponse, GetAccountOrderParams>(getAccountOrderQuery, {
      id,
    });
    return response?.account?.order || null;
  };

  /**
   * Get the orders for the user that is logged in.
   */
  const getAccountOrders = async (
    query: GetAccountOrdersParams = {},
  ) => {
    const response = await authenticatedRequest<GetAccountOrdersResponse, GetAccountOrdersParams>(getAccountOrdersQuery, {
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
  const getAccountOrganisationUsers = async () => {
    const response = await authenticatedRequest<GetAccountOrganisationUsersResponse>(getAccountOrganisationUsersQuery);
    const accountOrganisations = response?.account?.sharedOrganisations || [];

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
    input: UpdateOrganisationOnAccountInput['updateOrganisationOnAccountInput'],
  ) => {
    const response = await authenticatedRequest<UpdateOrganisationOnAccountResponse, UpdateOrganisationOnAccountInput>(updateOrganisationOnAccountMutation, {
      updateOrganisationOnAccountInput: input || {},
    });

    return response?.updateOrganisationOnAccount?.account || null;
  };

  /**
   * Reorder a previous order of the account by ID
   */
  const reorderAccountOrder = async (input: ReorderInput['reorderInput']) => {
    const response = await authenticatedRequest<ReorderResponse, ReorderInput>(reorderMutation, {
      reorderInput: input,
    });
    return response?.reorder?.cart || null;
  };

  /**
   * Get an order by ID
   */
  const getOrder = async (id: GetOrderParams['id']) => {
    const response = await request<GetOrderResponse, GetOrderParams>(getOrderQuery, {
      id,
    });
    return response?.order || null;
  };

  /**
   * Get the channel specific for the storefront token. If an id is provided, it will return the channel with that id.
   */
  const getChannel = async (id?: GetChannelParams['id']) => {
    const response = await request<GetChannelResponse, GetChannelParams>(getChannelQuery, {
      id,
    });
    return response?.channel || null;
  };

  /**
   * Subscribe to stock updates for the given SKU
   */
  const createStockUpdateSubscription = async (
    input: CreateStockUpdateSubscriptionInput['createStockUpdateSubscriptionInput'],
  ) => {
    const response = await request<CreateStockUpdateSubscriptionResponse, CreateStockUpdateSubscriptionInput>(createStockUpdateSubscriptionMutation, {
      createStockUpdateSubscriptionInput: input,
    });

    return response?.createStockUpdateSubscription || null;
  };

  /**
   * Approve a requested stock update subscription
   */
  const approveStockUpdateSubscription = async (
    token: ApproveStockUpdateSubscriptionInput['approveStockUpdateSubscriptionInput']['token'],
  ) => {
    const response = await request<ApproveStockUpdateSubscriptionResponse, ApproveStockUpdateSubscriptionInput>(approveStockUpdateSubscriptionMutation, {
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
    token: RemoveStockUpdateSubscriptionInput['removeStockUpdateSubscriptionInput']['token'],
  ) => {
    const response = await request<RemoveStockUpdateSubscriptionResponse, RemoveStockUpdateSubscriptionInput>(removeStockUpdateSubscriptionMutation, {
      removeStockUpdateSubscriptionInput: {
        token,
      },
    });
    return response?.removeStockUpdateSubscription || null;
  };

  /**
   * Get the projects for the user that is logged in.
   */
  const getAccountProjects = async () => {
    const response = await authenticatedRequest<GetAccountProjectsResponse>(getAccountProjectsQuery);
    const projects = response?.account?.projects || {};

    return {
      projects,
    };
  };

  /**
   * Create a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const createAccountRma = async (
    input: CreateAccountRmaWithItemsInput['input'] & {
      items?: CreateAccountRmaWithItemsInput['itemsInput']['items'],
    } = {},
  ) => {
    const { id, items = [], ...otherInput } = input || {};

    if (items.length > 0) {
      const rmaId = id ?? uuid();
      const response = await authenticatedRequest<CreateAccountRmaWithItemsResponse, CreateAccountRmaWithItemsInput>(createAccountRmaWithItemsMutation, {
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

    const response = await authenticatedRequest<CreateAccountRmaResponse, CreateAccountRmaInput>(createAccountRmaMutation, {
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
  const deleteAccountRma = async (id: DeleteAccountRmaInput['input']['id']) => {
    const response = await authenticatedRequest<DeleteAccountRmaResponse, DeleteAccountRmaInput>(deleteAccountRmaMutation, {
      input: {
        id,
      },
    });
    return response?.deleteRma?.isSuccessful || false;
  };

  /**
   * Get the Return Merchandise Authorizations (RMAs) for the user that is logged in.
   */
  const getAccountRmas = async (query: GetAccountRmasParams = {}) => {
    const response = await authenticatedRequest<GetAccountRmasResponse, GetAccountRmasParams>(getAccountRmasQuery, {
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
  const getAccountRma = async (id: GetAccountRmaParams['id']) => {
    const response = await authenticatedRequest<GetAccountRmaResponse, GetAccountRmaParams>(getAccountRmaQuery, {
      id,
    });
    return response?.rma || null;
  };

  /**
   * Update a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const updateAccountRma = async (input: UpdateAccountRmaInput['input']) => {
    const response = await authenticatedRequest<UpdateAccountRmaResponse, UpdateAccountRmaInput>(updateAccountRmaMutation, {
      input: input || {},
    });

    return response?.updateRma?.rma || null;
  };

  /**
   * Create items for a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const createAccountRmaItems = async (
    input: CreateAccountRmaItemsInput['input'],
  ) => {
    const response = await authenticatedRequest<CreateAccountRmaItemsResponse, CreateAccountRmaItemsInput>(createAccountRmaItemsMutation, {
      input: input || {},
    });
    return response?.createRmaItems?.rma || null;
  };

  /**
   * Delete items of a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const deleteAccountRmaItems = async (
    input: DeleteAccountRmaItemsInput['input'],
  ) => {
    const response = await authenticatedRequest<DeleteAccountRmaItemsResponse, DeleteAccountRmaItemsInput>(deleteAccountRmaItemsMutation, {
      input: input || {},
    });
    return response?.deleteRmaItems?.rma || null;
  };

  /**
   * Search for available items that can be added to a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const searchAccountRmaItems = async (
    query: SearchAccountRmaItemsParams = {},
  ) => {
    const response = await authenticatedRequest<SearchAccountRmaItemsResponse, SearchAccountRmaItemsParams>(searchAccountRmaItemsQuery, {
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
    input: UpdateAccountRmaItemsInput['input'],
  ) => {
    const response = await authenticatedRequest<UpdateAccountRmaItemsResponse, UpdateAccountRmaItemsInput>(updateAccountRmaItemsMutation, {
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
