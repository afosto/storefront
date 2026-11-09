import Cookies from 'js-cookie';
import { STOREFRONT_STORAGE_KEY_PREFIX, STOREFRONT_USER_TOKEN_COOKIE_NAME } from '../constants';
import type { DecodedUserToken, OptionalString, StorefrontClientConfig, User } from '../types';
import { parseJwt } from '../utils';
import { withDefault } from './config';

/**
 * Keeps the signed in user's token in memory and, when `storeUserToken` is on, in a cookie.
 */
export const createUserTokenStore = (
  config: StorefrontClientConfig,
  cookieOptions: Cookies.CookieAttributes,
) => {
  const cookieName = `${withDefault(config.storageKeyPrefix, STOREFRONT_STORAGE_KEY_PREFIX)}${STOREFRONT_USER_TOKEN_COOKIE_NAME}`;
  let storedUserToken: OptionalString = null;

  /**
   * Decode the user token.
   */
  const decodeUserToken = (token: string) => parseJwt(token);

  /**
   * Validate the user token.
   */
  const validateUserToken = (token: string) => {
    const decodedToken = decodeUserToken(token);

    if (!decodedToken) {
      return false;
    }

    const { exp, sub } = decodedToken;
    const currentTime = Date.now() / 1000;
    const isExpired = !exp || exp < currentTime;

    return sub && !isExpired;
  };

  /**
   * Return the user token.
   */
  const getUserToken = (): string | null => storedUserToken;

  /**
   * Remove the user token.
   */
  const removeUserToken = () => {
    storedUserToken = null;

    if (config.storeUserToken) {
      Cookies.remove(cookieName, cookieOptions);
    }
  };

  /**
   * Store the user token.
   */
  const storeUserToken = (token: string) => {
    storedUserToken = token;

    if (config.storeUserToken) {
      Cookies.set(cookieName, token, cookieOptions);
    }
  };

  /**
   * Initialize the user token from its cookie.
   */
  const initializeUserToken = () => {
    if (!config.storeUserToken) {
      removeUserToken();
      return;
    }

    const token = Cookies.get(cookieName);

    if (token && validateUserToken(token)) {
      storedUserToken = token;
    } else if (token) {
      removeUserToken();
    }
  };

  /**
   * Get the user that is logged in.
   */
  const getUser = (): User | null => {
    if (!storedUserToken || !validateUserToken(storedUserToken)) {
      return null;
    }

    // validateUserToken guarantees a decoded token with a `sub`.
    const {
      sub: id,
      email,
      family_name: familyName,
      given_name: givenName,
      name,
      organisation_id: organisationId,
      organisation_name: organisationName,
      contact_role: role,
    } = decodeUserToken(storedUserToken) as DecodedUserToken;

    try {
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
    } catch {
      // A claim with an unexpected type, for example a contact_role that is not a string.
      return null;
    }
  };

  return {
    getUser,
    getUserToken,
    initializeUserToken,
    removeUserToken,
    storeUserToken,
    validateUserToken,
  };
};

export type UserTokenStore = ReturnType<typeof createUserTokenStore>;
