import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { type GraphQLError, mockNetworkError, mockOperationError } from '../msw/graphql';
import {
  CART_TOKEN_STORAGE_KEY,
  PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY,
  WISHLIST_TOKEN_STORAGE_KEY,
  createTestClient,
} from './helpers';

type Client = ReturnType<typeof createTestClient>;

interface Case {
  method: string;
  operation: string;
  key: string;
  /** Call the method, using the stored token (`token` undefined) or an explicit one. */
  call: (client: Client, token?: string) => Promise<unknown>;
}

const STORED = 'TOKEN_STORED';
const EXPLICIT = 'TOKEN_EXPLICIT';
const notFound: GraphQLError = { message: 'Not found', extensions: { status: 404 } };
const serverError: GraphQLError = { message: 'Server error', extensions: { status: 500 } };

const asToken = (token?: string) => token as string;

/** Methods that only clean up a stale stored token on a 404 and then reject. */
const mutations: Case[] = [
  {
    method: 'confirmCart',
    operation: 'ConfirmCart',
    key: CART_TOKEN_STORAGE_KEY,
    call: (c, t) => c.confirmCart(t),
  },
  {
    method: 'removeCartItems',
    operation: 'RemoveItemsFromCart',
    key: CART_TOKEN_STORAGE_KEY,
    call: (c, t) => c.removeCartItems(['CI_1'], t),
  },
  {
    method: 'setCountryCodeForCart',
    operation: 'setCountryCodeForCart',
    key: CART_TOKEN_STORAGE_KEY,
    call: (c, t) => c.setCountryCodeForCart('NL', t),
  },
  {
    method: 'addCouponToCart',
    operation: 'AddCouponToCart',
    key: CART_TOKEN_STORAGE_KEY,
    call: (c, t) => c.addCouponToCart('WELCOME10', t),
  },
  {
    method: 'removeCouponFromCart',
    operation: 'RemoveCouponFromCart',
    key: CART_TOKEN_STORAGE_KEY,
    call: (c, t) => c.removeCouponFromCart('WELCOME10', t),
  },
  {
    method: 'deleteWishlist',
    operation: 'DeleteWishlist',
    key: WISHLIST_TOKEN_STORAGE_KEY,
    call: (c, t) => c.deleteWishlist(t),
  },
  {
    method: 'removeWishlistItem',
    operation: 'RemoveItemFromWishlist',
    key: WISHLIST_TOKEN_STORAGE_KEY,
    call: (c, t) => c.removeWishlistItem('SKU-1', t),
  },
  {
    method: 'deleteProductViewingHistory',
    operation: 'DeleteProductViewingHistory',
    key: PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY,
    call: (c, t) => c.deleteProductViewingHistory(asToken(t)),
  },
];

/** Getters resolve null instead of rejecting when the stored token fails. */
const getters: Case[] = [
  {
    method: 'getCart',
    operation: 'GetCart',
    key: CART_TOKEN_STORAGE_KEY,
    call: (c, t) => c.getCart(t),
  },
  {
    method: 'getWishlist',
    operation: 'GetWishlist',
    key: WISHLIST_TOKEN_STORAGE_KEY,
    call: (c, t) => c.getWishlist(t),
  },
  {
    method: 'getProductViewingHistory',
    operation: 'GetProductViewingHistory',
    key: PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY,
    call: (c, t) => c.getProductViewingHistory(asToken(t)),
  },
];

const notFoundRejection = {
  response: { errors: [expect.objectContaining({ extensions: { status: 404 } })] },
};

describe('stale token recovery', () => {
  describe('on a 404 for the stored token', () => {
    it.each(mutations)('$method clears the stored token and rejects', async c => {
      localStorage.setItem(c.key, STORED);
      server.use(mockOperationError(c.operation, [notFound]));

      await expect(c.call(createTestClient())).rejects.toMatchObject(notFoundRejection);
      expect(localStorage.getItem(c.key)).toBeNull();
    });

    it.each(getters)('$method clears the stored token and resolves null', async c => {
      localStorage.setItem(c.key, STORED);
      server.use(mockOperationError(c.operation, [notFound]));

      await expect(c.call(createTestClient())).resolves.toBeNull();
      expect(localStorage.getItem(c.key)).toBeNull();
    });
  });

  describe('on any other failure the stored token is kept', () => {
    it.each(mutations)('$method rejects on a 500', async c => {
      localStorage.setItem(c.key, STORED);
      server.use(mockOperationError(c.operation, [serverError]));

      await expect(c.call(createTestClient())).rejects.toBeDefined();
      expect(localStorage.getItem(c.key)).toBe(STORED);
    });

    it.each(getters)('$method resolves null on a 500', async c => {
      localStorage.setItem(c.key, STORED);
      server.use(mockOperationError(c.operation, [serverError]));

      await expect(c.call(createTestClient())).resolves.toBeNull();
      expect(localStorage.getItem(c.key)).toBe(STORED);
    });

    it.each(getters)('$method resolves null on a network error', async c => {
      localStorage.setItem(c.key, STORED);
      server.use(mockNetworkError(c.operation));

      await expect(c.call(createTestClient())).resolves.toBeNull();
      expect(localStorage.getItem(c.key)).toBe(STORED);
    });
  });

  describe('an explicitly passed token skips recovery', () => {
    it.each([...mutations, ...getters])(
      '$method rejects with the 404 and leaves the stored token alone',
      async c => {
        localStorage.setItem(c.key, STORED);
        server.use(mockOperationError(c.operation, [notFound]));

        await expect(c.call(createTestClient(), EXPLICIT)).rejects.toMatchObject(notFoundRejection);
        expect(localStorage.getItem(c.key)).toBe(STORED);
      },
    );
  });
});
