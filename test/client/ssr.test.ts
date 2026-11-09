// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { type CapturedRequest, mockOperation } from '../msw/graphql';
import { cartSnakeCase } from '../msw/fixtures/cart';
import { validUserToken } from '../msw/fixtures/auth';
import { STOREFRONT_TOKEN, createTestClient } from './helpers';

/**
 * Server-side rendering: no window, document or Web Storage. Creating a client
 * must not throw, token storage must be disabled and requests must still work.
 */
describe('without a browser (SSR)', () => {
  it('runs in an environment without window, document or storage', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(typeof localStorage).toBe('undefined');
  });

  it.each(['cookie', 'localStorage', 'sessionStorage'] as const)(
    'creates a client with %s token storage and disables storing tokens',
    type => {
      const client = createTestClient({
        cartTokenStorageType: type,
        wishlistTokenStorageType: type,
        productViewingHistoryTokenStorageType: type,
      });

      client.storeCartTokenInStorage('CA_1');
      client.storeWishlistTokenInStorage('WL_1');
      client.storeProductViewingHistoryTokenInStorage('PVH_1');
      client.removeCartTokenFromStorage();

      expect(client.getCartTokenFromStorage()).toBeNull();
      expect(client.getWishlistTokenFromStorage()).toBeNull();
      expect(client.getProductViewingHistoryTokenFromStorage()).toBeNull();
      expect(client.getUserToken()).toBeNull();
      expect(client.getUser()).toBeNull();
    },
  );

  it('still sends requests with the storefront token', async () => {
    let captured: CapturedRequest | undefined;
    server.use(
      mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, info => {
        captured = info;
      }),
    );

    const cart = await createTestClient().createCart();

    expect(cart?.id).toBe(cartSnakeCase.id);
    expect(captured?.authorization).toBe(`Bearer ${STOREFRONT_TOKEN}`);
  });

  it('keeps a signed-in user in memory without a cookie', async () => {
    const token = validUserToken();
    server.use(mockOperation('SignInMutation', { logInCustomer: { token } }));
    const client = createTestClient();

    const user = await client.signIn({ email: 'ada@example.com', password: 'secret' });

    expect(user?.email).toBe('ada@example.com');
    expect(client.getUserToken()).toBe(token);
  });
});
