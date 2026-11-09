import type { createGraphQLClient } from '@afosto/graphql-client';
import type { StorefrontClientConfig } from '../types';
import type { TokenStore } from './tokenStore';
import type { UserTokenStore } from './userToken';

export type GraphQLRequest = <
  TResponse,
  TVariables extends Record<string, any> = Record<string, any>,
>(
  gqlQuery: string,
  variables?: TVariables,
  requestOptions?: object,
) => Promise<TResponse>;

/**
 * Creates the two ways to send a request: with the storefront token (public storefront data)
 * and with the user token (account data).
 */
export const createRequests = (
  gqlClient: ReturnType<typeof createGraphQLClient>,
  config: StorefrontClientConfig,
  getUserToken: () => string | null,
) => {
  /**
   * Send a graphQL request.
   */
  const request: GraphQLRequest = async (gqlQuery, variables, requestOptions = {}) =>
    gqlClient.request(gqlQuery, variables ?? {}, {
      authorization: `Bearer ${config.storefrontToken || ''}`,
      ...requestOptions,
    });

  /**
   * Send an authenticated graphQL request with the user token.
   */
  const authenticatedRequest: GraphQLRequest = async (gqlQuery, variables, requestOptions = {}) =>
    gqlClient.request(gqlQuery, variables ?? {}, {
      authorization: `Bearer ${getUserToken() || ''}`,
      ...requestOptions,
    });

  return { request, authenticatedRequest };
};

/**
 * What every domain of the client gets: the configuration, the two request functions and the
 * token stores.
 */
export interface ClientContext {
  config: StorefrontClientConfig;
  request: GraphQLRequest;
  authenticatedRequest: GraphQLRequest;
  cartToken: TokenStore;
  wishlistToken: TokenStore;
  productViewingHistoryToken: TokenStore;
  userToken: UserTokenStore;
  getSessionID: () => string | null;
}
