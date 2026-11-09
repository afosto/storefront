import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../msw/server';
import {
  type CapturedRequest,
  mockOperation,
  mockOperationError,
  mockOperationSequence,
} from '../msw/graphql';
import { cartNotFoundError, cartSnakeCase, recreatedCartSnakeCase } from '../msw/fixtures/cart';
import { CART_TOKEN_STORAGE_KEY, STOREFRONT_TOKEN, createTestClient } from './helpers';

/**
 * Cart domain: the autoCreate flow, input validation and what is sent. Stale
 * token recovery shared with the other domains lives in recovery.test.ts and
 * token storage in storage.test.ts.
 */
describe('cart', () => {
  const CART_ID = cartSnakeCase.id;
  const seedStoredToken = (token = CART_ID) => localStorage.setItem(CART_TOKEN_STORAGE_KEY, token);

  /** Record the requests of the given operations, in order. */
  const record = () => {
    const requests: CapturedRequest[] = [];
    return { requests, push: (info: CapturedRequest) => requests.push(info) };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createCart', () => {
    it('creates a cart, stores its id and returns the camelCase cart', async () => {
      let captured: CapturedRequest | undefined;
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, info => {
          captured = info;
        }),
      );

      const cart = await createTestClient().createCart();

      expect(cart?.id).toBe(CART_ID);
      expect(cart?.createdAt).toBe(cartSnakeCase.created_at);
      expect(cart?.isIncludingVat).toBe(true);
      expect(cart?.customer.countryCode).toBe('NL');
      expect(cart?.items[0].details[0].pricing.originalAmount).toBe(3000);
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(CART_ID);
      expect(captured?.authorization).toBe(`Bearer ${STOREFRONT_TOKEN}`);
    });

    it('still returns the cart when writing the token to storage throws', async () => {
      server.use(mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }));
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage full');
      });

      const cart = await createTestClient().createCart();

      expect(cart?.id).toBe(CART_ID);
    });
  });

  describe('getCart', () => {
    it('returns null without a request when there is no cart token', async () => {
      // Any request would fail on MSW's onUnhandledRequest: 'error'.
      await expect(createTestClient().getCart()).resolves.toBeNull();
    });

    it('fetches the cart for the stored token', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('GetCart', { cart: cartSnakeCase }, info => {
          variables = info.variables;
        }),
      );

      const cart = await createTestClient().getCart();

      expect(variables).toEqual({ id: CART_ID });
      expect(cart?.totalExcludingVat).toBe(5000);
    });

    it('reads no token when reading from storage throws', () => {
      seedStoredToken();
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage blocked');
      });

      expect(createTestClient().getCartTokenFromStorage()).toBeNull();
    });
  });

  describe('addCartItems', () => {
    const items = [{ sku: 'SKU-1', quantity: 1 }];

    it('auto-creates a cart when there is no token, then adds the items to it', async () => {
      const { requests, push } = record();
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, push),
        mockOperation('AddItemsToCart', { addItemsToCart: { cart: cartSnakeCase } }, push),
      );

      const cart = await createTestClient().addCartItems(items);

      expect(requests.map(r => r.operationName)).toEqual(['CreateCart', 'AddItemsToCart']);
      expect(requests[1].variables.add_items_to_cart_input).toEqual({ cart_id: CART_ID, items });
      expect(cart?.id).toBe(CART_ID);
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(CART_ID);
    });

    it('on a 404 drops the stale token, recreates the cart and retries', async () => {
      seedStoredToken('CA_stale');
      const { requests, push } = record();
      server.use(
        mockOperation('CreateCart', { createCart: { cart: recreatedCartSnakeCase } }, push),
        mockOperationSequence(
          'AddItemsToCart',
          [
            { errors: [cartNotFoundError] },
            { data: { addItemsToCart: { cart: recreatedCartSnakeCase } } },
          ],
          push,
        ),
      );

      const cart = await createTestClient().addCartItems(items);

      expect(requests.map(r => r.operationName)).toEqual([
        'AddItemsToCart',
        'CreateCart',
        'AddItemsToCart',
      ]);
      expect(requests[2].variables.add_items_to_cart_input).toMatchObject({
        cart_id: recreatedCartSnakeCase.id,
      });
      expect(cart?.id).toBe(recreatedCartSnakeCase.id);
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(recreatedCartSnakeCase.id);
    });

    it('passes a non-404 error through and keeps the stored token', async () => {
      seedStoredToken();
      server.use(
        mockOperationError('AddItemsToCart', [{ message: 'Error', extensions: { status: 500 } }]),
      );

      await expect(createTestClient().addCartItems(items)).rejects.toBeDefined();
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(CART_ID);
    });

    it('with autoCreateCart off, neither creates a cart nor recovers from a 404', async () => {
      seedStoredToken();
      const { requests, push } = record();
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, push),
        mockOperationError('AddItemsToCart', [cartNotFoundError]),
      );

      await expect(
        createTestClient({ autoCreateCart: false }).addCartItems(items),
      ).rejects.toBeDefined();
      expect(requests).toEqual([]);
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(CART_ID);
    });
  });

  describe('removeCartItems', () => {
    it('rejects when there is no cart token', async () => {
      await expect(createTestClient().removeCartItems(['CI_1'])).rejects.toThrow(
        'No cart token provided',
      );
    });

    it('rejects when no ids are provided', async () => {
      seedStoredToken();
      await expect(createTestClient().removeCartItems([])).rejects.toThrow(
        'at least one cart item id',
      );
    });

    it('sends the item ids and the stored token', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'RemoveItemsFromCart',
          { removeItemsFromCart: { cart: cartSnakeCase } },
          i => {
            variables = i.variables;
          },
        ),
      );

      const cart = await createTestClient().removeCartItems(['CI_1', 'CI_2']);

      expect(variables?.remove_items_from_cart_input).toEqual({
        cart_id: CART_ID,
        ids: ['CI_1', 'CI_2'],
      });
      expect(cart?.id).toBe(CART_ID);
    });
  });

  describe('setCountryCodeForCart', () => {
    it('auto-creates a cart when there is no token', async () => {
      const { requests, push } = record();
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, push),
        mockOperation(
          'setCountryCodeForCart',
          { setCountryCodeForCart: { cart: cartSnakeCase } },
          push,
        ),
      );

      const cart = await createTestClient().setCountryCodeForCart('NL');

      expect(requests.map(r => r.operationName)).toEqual(['CreateCart', 'setCountryCodeForCart']);
      expect(cart?.customer.countryCode).toBe('NL');
    });

    it('rejects when the country code is not defined', async () => {
      seedStoredToken();
      await expect(
        // @ts-expect-error deliberately passing an undefined country code
        createTestClient().setCountryCodeForCart(undefined),
      ).rejects.toThrow('Provide a country code');
    });
  });

  describe('coupons', () => {
    it('adds a coupon, auto-creating the cart when needed', async () => {
      const { requests, push } = record();
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, push),
        mockOperation('AddCouponToCart', { addCouponToCart: { cart: cartSnakeCase } }, push),
      );

      const cart = await createTestClient().addCouponToCart('WELCOME10');

      expect(requests.map(r => r.operationName)).toEqual(['CreateCart', 'AddCouponToCart']);
      expect(cart?.coupons[0].code).toBe('WELCOME10');
    });

    it('rejects adding a coupon without a code', async () => {
      seedStoredToken();
      // @ts-expect-error deliberately passing an undefined coupon
      await expect(createTestClient().addCouponToCart(undefined)).rejects.toThrow(
        'Provide a coupon code',
      );
    });

    it('rejects removing a coupon without a cart token', async () => {
      await expect(createTestClient().removeCouponFromCart('WELCOME10')).rejects.toThrow(
        'No cart token provided',
      );
    });

    it('rejects removing a coupon without a code', async () => {
      seedStoredToken();
      // @ts-expect-error deliberately passing an undefined coupon
      await expect(createTestClient().removeCouponFromCart(undefined)).rejects.toThrow(
        'Provide the coupon code that should be removed',
      );
    });

    it('removes a coupon from the stored cart', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'RemoveCouponFromCart',
          { removeCouponFromCart: { cart: cartSnakeCase } },
          i => {
            variables = i.variables;
          },
        ),
      );

      await createTestClient().removeCouponFromCart('WELCOME10');

      expect(variables?.coupon_input).toEqual({ cart_id: CART_ID, coupon: 'WELCOME10' });
    });
  });

  describe('confirmCart', () => {
    it('rejects when there is no cart token', async () => {
      await expect(createTestClient().confirmCart()).rejects.toThrow('No cart token provided');
    });

    it('confirms the stored cart with the return urls and returns the order', async () => {
      seedStoredToken();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation(
          'ConfirmCart',
          { confirmCart: { order: { id: 'OR_1', number: '1001' } } },
          i => {
            variables = i.variables;
          },
        ),
      );
      const client = createTestClient();

      const order = await client.confirmCart(undefined, {
        checkout: { successReturnUrl: 'https://ok', failureReturnUrl: 'https://no' },
      } as Parameters<typeof client.confirmCart>[1]);

      expect(order).toEqual({ id: 'OR_1', number: '1001' });
      expect(variables?.confirm_cart_input).toMatchObject({
        cart_id: CART_ID,
        checkout: { success_return_url: 'https://ok', failure_return_url: 'https://no' },
      });
    });
  });
});
