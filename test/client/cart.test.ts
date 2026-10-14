import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../msw/server';
import { mockOperation, mockOperationError, mockOperationSequence } from '../msw/graphql';
import {
  cartNotFoundError,
  cartSnakeCase,
  recreatedCartSnakeCase,
} from '../msw/fixtures/cart';
import { CART_TOKEN_STORAGE_KEY, STOREFRONT_TOKEN, createTestClient } from './helpers';

/**
 * Cart domain — the fully worked-out blueprint for the other domains.
 *
 * Covers: the autoCreate flow, still-valid recovery on a 404, storageType
 * validation and variants, missing storage, and failed requests that must not
 * corrupt stored data. Fixtures are `snake_case`; assertions expect the
 * `camelCase` result produced by the `@afosto/graphql-client` conversion layer.
 */
describe('cart domain', () => {
  const seedStoredToken = (token = cartSnakeCase.id) => {
    localStorage.setItem(CART_TOKEN_STORAGE_KEY, token);
  };

  describe('createCart', () => {
    it('creates a cart, stores the token and returns the camelCase cart', async () => {
      let captured: { variables: Record<string, unknown>; request: Request } | undefined;
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, info => {
          captured = info;
        }),
      );

      const client = createTestClient();
      const cart = await client.createCart();

      // snake_case fixture is converted to camelCase for the caller.
      expect(cart?.id).toBe(cartSnakeCase.id);
      expect(cart?.createdAt).toBe(cartSnakeCase.created_at);
      expect(cart?.isIncludingVat).toBe(true);
      expect(cart?.totalExcludingVat).toBe(5000);
      expect(cart?.customer.countryCode).toBe('NL');
      expect(cart?.items[0].details[0].pricing.originalAmount).toBe(3000);

      // Token is persisted in storage.
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(cartSnakeCase.id);

      // Request carries the storefront token (not the user token).
      expect(captured?.request.headers.get('authorization')).toBe(`Bearer ${STOREFRONT_TOKEN}`);
      // An auto-generated session id is sent, in snake_case.
      const input = captured?.variables.cart_input as Record<string, unknown>;
      expect(typeof input.session_id).toBe('string');
    });
  });

  describe('getCart', () => {
    it('returns null when there is no cart token', async () => {
      const client = createTestClient();
      await expect(client.getCart()).resolves.toBeNull();
    });

    it('fetches the stored cart and converts it to camelCase', async () => {
      seedStoredToken();
      server.use(mockOperation('GetCart', { cart: cartSnakeCase }));

      const client = createTestClient();
      const cart = await client.getCart();

      expect(cart?.id).toBe(cartSnakeCase.id);
      expect(cart?.totalExcludingVat).toBe(5000);
    });

    it('drops the stored token and returns null on a 404 (server no longer knows the cart)', async () => {
      seedStoredToken();
      server.use(mockOperationError('GetCart', [cartNotFoundError]));

      const client = createTestClient();
      const cart = await client.getCart();

      expect(cart).toBeNull();
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('propagates the error for an explicitly passed token (no recovery)', async () => {
      seedStoredToken();
      server.use(mockOperationError('GetCart', [cartNotFoundError]));

      const client = createTestClient();
      await expect(client.getCart('CA_explicit')).rejects.toBeDefined();
      // The stored token is untouched because recovery only runs for the stored one.
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(cartSnakeCase.id);
    });
  });

  describe('addCartItems — autoCreate flow', () => {
    const items = [{ sku: 'SKU-1', quantity: 1 }];

    it('auto-creates a cart first when no token exists, then adds the items', async () => {
      const operations: string[] = [];
      let addVariables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, () =>
          operations.push('CreateCart'),
        ),
        mockOperation('AddItemsToCart', { addItemsToCart: { cart: cartSnakeCase } }, info => {
          operations.push('AddItemsToCart');
          addVariables = info.variables;
        }),
      );

      const client = createTestClient();
      const cart = await client.addCartItems(items);

      expect(operations).toEqual(['CreateCart', 'AddItemsToCart']);
      expect(cart?.id).toBe(cartSnakeCase.id);
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(cartSnakeCase.id);

      // autoCreate is a client-side option and must never leak into the GraphQL input.
      const raw = JSON.stringify(addVariables);
      expect(raw).not.toMatch(/auto_?create/i);
    });

    it('recovers on a 404: removes the stale token and recreates the cart before adding', async () => {
      seedStoredToken('CA_stale');
      const created: string[] = [];

      server.use(
        mockOperation('CreateCart', { createCart: { cart: recreatedCartSnakeCase } }, () =>
          created.push('CreateCart'),
        ),
        // First AddItemsToCart (with the stale token) 404s; after the client
        // drops the token and recreates the cart, the retry succeeds.
        mockOperationSequence('AddItemsToCart', [
          { errors: [cartNotFoundError] },
          { data: { addItemsToCart: { cart: recreatedCartSnakeCase } } },
        ]),
      );

      const client = createTestClient();
      const cart = await client.addCartItems(items);

      // Stale token removed, cart recreated, second add succeeded.
      expect(created).toEqual(['CreateCart']);
      expect(cart?.id).toBe(recreatedCartSnakeCase.id);
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(recreatedCartSnakeCase.id);
    });

    it('passes a non-404 error through and keeps the stored token intact (no data corruption)', async () => {
      seedStoredToken();
      server.use(
        mockOperationError('AddItemsToCart', [
          { message: 'Server error', extensions: { status: 500 } },
        ]),
      );

      const client = createTestClient();
      await expect(client.addCartItems(items)).rejects.toBeDefined();
      // Not a 404, so the token is preserved.
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(cartSnakeCase.id);
    });

    it('with autoCreateCart off, does not create a cart and passes the error through', async () => {
      seedStoredToken();
      const created: string[] = [];
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, () =>
          created.push('CreateCart'),
        ),
        mockOperationError('AddItemsToCart', [cartNotFoundError]),
      );

      const client = createTestClient({ autoCreateCart: false });
      await expect(client.addCartItems(items)).rejects.toBeDefined();

      expect(created).toEqual([]);
      // Token untouched because recovery is gated on autoCreateCart.
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(cartSnakeCase.id);
    });
  });

  describe('removeCartItems', () => {
    it('rejects when there is no cart token', async () => {
      const client = createTestClient();
      await expect(client.removeCartItems(['CI_1'])).rejects.toThrow('No cart token provided');
    });

    it('rejects when no ids are provided', async () => {
      seedStoredToken();
      const client = createTestClient();
      await expect(client.removeCartItems([])).rejects.toThrow('at least one cart item id');
    });

    it('removes items and returns the updated cart', async () => {
      seedStoredToken();
      server.use(mockOperation('RemoveItemsFromCart', { removeItemsFromCart: { cart: cartSnakeCase } }));

      const client = createTestClient();
      const cart = await client.removeCartItems(['CI_1']);
      expect(cart?.id).toBe(cartSnakeCase.id);
    });
  });

  describe('setCountryCodeForCart', () => {
    it('auto-creates a cart when no token exists', async () => {
      const operations: string[] = [];
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, () =>
          operations.push('CreateCart'),
        ),
        mockOperation('SetCountryCodeForCart', { setCountryCodeForCart: { cart: cartSnakeCase } }, () =>
          operations.push('SetCountryCodeForCart'),
        ),
      );

      const client = createTestClient();
      const cart = await client.setCountryCodeForCart('NL');

      expect(operations).toEqual(['CreateCart', 'SetCountryCodeForCart']);
      expect(cart?.customer.countryCode).toBe('NL');
    });

    it('rejects when the country code is not defined', async () => {
      seedStoredToken();
      const client = createTestClient();
      // @ts-expect-error deliberately passing an undefined country code
      await expect(client.setCountryCodeForCart(undefined)).rejects.toThrow('Provide a country code');
    });
  });

  describe('coupons', () => {
    it('adds a coupon, auto-creating the cart when needed', async () => {
      const operations: string[] = [];
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, () =>
          operations.push('CreateCart'),
        ),
        mockOperation('AddCouponToCart', { addCouponToCart: { cart: cartSnakeCase } }, () =>
          operations.push('AddCouponToCart'),
        ),
      );

      const client = createTestClient();
      const cart = await client.addCouponToCart('WELCOME10');

      expect(operations).toEqual(['CreateCart', 'AddCouponToCart']);
      expect(cart?.coupons[0].code).toBe('WELCOME10');
    });

    it('rejects adding a coupon without a code', async () => {
      seedStoredToken();
      const client = createTestClient();
      // @ts-expect-error deliberately passing an undefined coupon
      await expect(client.addCouponToCart(undefined)).rejects.toThrow('Provide a coupon code');
    });

    it('rejects removing a coupon without a cart token', async () => {
      const client = createTestClient();
      await expect(client.removeCouponFromCart('WELCOME10')).rejects.toThrow('No cart token provided');
    });

    it('removes a coupon from the cart', async () => {
      seedStoredToken();
      server.use(mockOperation('RemoveCouponFromCart', { removeCouponFromCart: { cart: cartSnakeCase } }));

      const client = createTestClient();
      const cart = await client.removeCouponFromCart('WELCOME10');
      expect(cart?.id).toBe(cartSnakeCase.id);
    });
  });

  describe('confirmCart', () => {
    it('rejects when there is no cart token', async () => {
      const client = createTestClient();
      await expect(client.confirmCart()).rejects.toThrow('No cart token provided');
    });

    it('confirms the cart and returns the created order', async () => {
      seedStoredToken();
      server.use(
        mockOperation('ConfirmCart', {
          confirmCart: { order: { id: 'OR_1', number: '1001' } },
        }),
      );

      const client = createTestClient();
      const order = await client.confirmCart();
      expect(order).toEqual({ id: 'OR_1', number: '1001' });
    });
  });

  describe('storageType validation & variants', () => {
    it('throws for an invalid cart token storage type', () => {
      expect(() =>
        // @ts-expect-error invalid storage type on purpose
        createTestClient({ cartTokenStorageType: 'indexedDB' }),
      ).toThrow(/Invalid storage type/);
    });

    it('stores the token in sessionStorage when configured', async () => {
      server.use(mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }));

      const client = createTestClient({ cartTokenStorageType: 'sessionStorage' });
      await client.createCart();

      expect(sessionStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(cartSnakeCase.id);
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('stores the token in a cookie when configured', async () => {
      server.use(mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }));

      const client = createTestClient({ cartTokenStorageType: 'cookie' });
      await client.createCart();

      expect(document.cookie).toContain(`${CART_TOKEN_STORAGE_KEY}=`);
    });
  });

  describe('missing / unavailable storage', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('still returns the cart when writing the token to storage throws', async () => {
      server.use(mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }));
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage full');
      });

      const client = createTestClient();
      const cart = await client.createCart();

      // The storage error is swallowed; the cart is returned regardless.
      expect(cart?.id).toBe(cartSnakeCase.id);
    });

    it('reads no token (returns null) when reading from storage throws', () => {
      seedStoredToken();
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage blocked');
      });

      const client = createTestClient();
      expect(client.getCartTokenFromStorage()).toBeNull();
    });
  });
});
