import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { mockOperationError } from '../msw/graphql';
import { cartNotFoundError, cartSnakeCase } from '../msw/fixtures/cart';
import { wishlistNotFoundError, wishlistSnakeCase } from '../msw/fixtures/wishlist';
import {
  productViewingHistoryNotFoundError,
  productViewingHistorySnakeCase,
} from '../msw/fixtures/productViewingHistory';
import {
  CART_TOKEN_STORAGE_KEY,
  PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY,
  WISHLIST_TOKEN_STORAGE_KEY,
  createTestClient,
} from './helpers';

/**
 * The still-valid recovery branches of the non-add mutations. Each of these
 * only clears the stored token on a 404 and re-rejects (they do not retry), so
 * the caller sees the error while the stale token is cleaned up.
 */
describe('still-valid recovery branches (reject after cleanup)', () => {
  describe('cart', () => {
    const seed = () => localStorage.setItem(CART_TOKEN_STORAGE_KEY, cartSnakeCase.id);

    it('confirmCart clears the token and rejects on a 404', async () => {
      seed();
      server.use(mockOperationError('ConfirmCart', [cartNotFoundError]));
      const client = createTestClient();
      await expect(client.confirmCart()).rejects.toBeDefined();
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('removeCartItems clears the token and rejects on a 404', async () => {
      seed();
      server.use(mockOperationError('RemoveItemsFromCart', [cartNotFoundError]));
      const client = createTestClient();
      await expect(client.removeCartItems(['CI_1'])).rejects.toBeDefined();
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('setCountryCodeForCart clears the token and rejects on a 404', async () => {
      seed();
      server.use(mockOperationError('SetCountryCodeForCart', [cartNotFoundError]));
      const client = createTestClient();
      await expect(client.setCountryCodeForCart('NL')).rejects.toBeDefined();
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('addCouponToCart clears the token and rejects on a 404', async () => {
      seed();
      server.use(mockOperationError('AddCouponToCart', [cartNotFoundError]));
      const client = createTestClient();
      await expect(client.addCouponToCart('WELCOME10')).rejects.toBeDefined();
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('removeCouponFromCart clears the token and rejects on a 404', async () => {
      seed();
      server.use(mockOperationError('RemoveCouponFromCart', [cartNotFoundError]));
      const client = createTestClient();
      await expect(client.removeCouponFromCart('WELCOME10')).rejects.toBeDefined();
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('does not clear the token on a non-404 error', async () => {
      seed();
      server.use(
        mockOperationError('RemoveCouponFromCart', [
          { message: 'Server error', extensions: { status: 500 } },
        ]),
      );
      const client = createTestClient();
      await expect(client.removeCouponFromCart('WELCOME10')).rejects.toBeDefined();
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(cartSnakeCase.id);
    });

    it('rejects removeCouponFromCart without a coupon code', async () => {
      seed();
      const client = createTestClient();
      // @ts-expect-error deliberately passing an undefined coupon
      await expect(client.removeCouponFromCart(undefined)).rejects.toThrow(
        'Provide the coupon code that should be removed',
      );
    });
  });

  /**
   * When an explicit token is passed the recovery branch is skipped entirely
   * (its `!token` guard is false), so the error propagates unchanged.
   */
  describe('explicit token bypasses recovery (error propagates)', () => {
    it('confirmCart with an explicit token propagates the error', async () => {
      server.use(mockOperationError('ConfirmCart', [cartNotFoundError]));
      await expect(createTestClient().confirmCart('CA_explicit')).rejects.toBeDefined();
    });

    it('removeCartItems with an explicit token propagates the error', async () => {
      server.use(mockOperationError('RemoveItemsFromCart', [cartNotFoundError]));
      await expect(createTestClient().removeCartItems(['CI_1'], 'CA_explicit')).rejects.toBeDefined();
    });

    it('setCountryCodeForCart with an explicit token propagates the error', async () => {
      server.use(mockOperationError('SetCountryCodeForCart', [cartNotFoundError]));
      await expect(createTestClient().setCountryCodeForCart('NL', 'CA_explicit')).rejects.toBeDefined();
    });

    it('addCouponToCart with an explicit token propagates the error', async () => {
      server.use(mockOperationError('AddCouponToCart', [cartNotFoundError]));
      await expect(createTestClient().addCouponToCart('X', 'CA_explicit')).rejects.toBeDefined();
    });

    it('removeCouponFromCart with an explicit token propagates the error', async () => {
      server.use(mockOperationError('RemoveCouponFromCart', [cartNotFoundError]));
      await expect(createTestClient().removeCouponFromCart('X', 'CA_explicit')).rejects.toBeDefined();
    });

    it('deleteWishlist with an explicit token propagates the error', async () => {
      server.use(mockOperationError('DeleteWishlist', [wishlistNotFoundError]));
      await expect(createTestClient().deleteWishlist('WL_explicit')).rejects.toBeDefined();
    });

    it('removeWishlistItem with an explicit token propagates the error', async () => {
      server.use(mockOperationError('RemoveItemFromWishlist', [wishlistNotFoundError]));
      await expect(createTestClient().removeWishlistItem('SKU-1', 'WL_explicit')).rejects.toBeDefined();
    });

    it('deleteProductViewingHistory with an explicit token propagates the error', async () => {
      server.use(
        mockOperationError('DeleteProductViewingHistory', [productViewingHistoryNotFoundError]),
      );
      await expect(
        createTestClient().deleteProductViewingHistory('PVH_explicit'),
      ).rejects.toBeDefined();
    });
  });

  describe('wishlist', () => {
    const seed = () => localStorage.setItem(WISHLIST_TOKEN_STORAGE_KEY, wishlistSnakeCase.token);

    it('deleteWishlist clears the token and rejects on a 404', async () => {
      seed();
      server.use(mockOperationError('DeleteWishlist', [wishlistNotFoundError]));
      const client = createTestClient();
      await expect(client.deleteWishlist()).rejects.toBeDefined();
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('removeWishlistItem clears the token and rejects on a 404', async () => {
      seed();
      server.use(mockOperationError('RemoveItemFromWishlist', [wishlistNotFoundError]));
      const client = createTestClient();
      await expect(
        client.removeWishlistItem('SKU-1', undefined as unknown as string),
      ).rejects.toBeDefined();
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBeNull();
    });
  });

  describe('product viewing history', () => {
    const seed = () =>
      localStorage.setItem(
        PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY,
        productViewingHistorySnakeCase.token,
      );

    it('deleteProductViewingHistory clears the token and rejects on a 404', async () => {
      seed();
      server.use(
        mockOperationError('DeleteProductViewingHistory', [productViewingHistoryNotFoundError]),
      );
      const client = createTestClient();
      await expect(
        client.deleteProductViewingHistory(undefined as unknown as string),
      ).rejects.toBeDefined();
      expect(localStorage.getItem(PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY)).toBeNull();
    });
  });
});
