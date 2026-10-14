import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { mockNetworkError, mockOperation } from '../msw/graphql';
import { cartSnakeCase } from '../msw/fixtures/cart';
import { wishlistSnakeCase } from '../msw/fixtures/wishlist';
import { productViewingHistorySnakeCase } from '../msw/fixtures/productViewingHistory';
import { makeUserJwt, oneHourFromNow, validUserToken } from '../msw/fixtures/auth';
import Cookies from 'js-cookie';
import {
  CART_TOKEN_STORAGE_KEY,
  PRODUCT_VIEWING_HISTORY_TOKEN_STORAGE_KEY as PVH_KEY,
  STOREFRONT_TOKEN,
  USER_TOKEN_COOKIE_KEY,
  WISHLIST_TOKEN_STORAGE_KEY,
  createSignedInClient,
  createTestClient,
} from './helpers';

/**
 * Branch-coverage tests: the defensive fallback arms (`?. || null`,
 * `input || {}`, storage ternaries, autoCreate-returns-null) that the
 * happy-path domain tests do not reach.
 */
describe('branch coverage', () => {
  const seedCart = () => localStorage.setItem(CART_TOKEN_STORAGE_KEY, cartSnakeCase.id);
  const seedWishlist = () => localStorage.setItem(WISHLIST_TOKEN_STORAGE_KEY, wishlistSnakeCase.token);
  const seedPvh = () => localStorage.setItem(PVH_KEY, productViewingHistorySnakeCase.token);

  // --- A. Empty responses fall back to null / [] / false / {} -------------
  describe('empty responses use the fallback value', () => {
    it('cart mutations & queries return null', async () => {
      seedCart();
      const client = createTestClient();
      server.use(
        mockOperation('CreateCart', { createCart: {} }),
        mockOperation('GetCart', {}),
        mockOperation('AddItemsToCart', { addItemsToCart: {} }),
        mockOperation('RemoveItemsFromCart', { removeItemsFromCart: {} }),
        mockOperation('SetCountryCodeForCart', { setCountryCodeForCart: {} }),
        mockOperation('AddCouponToCart', { addCouponToCart: {} }),
        mockOperation('RemoveCouponFromCart', { removeCouponFromCart: {} }),
        mockOperation('ConfirmCart', { confirmCart: {} }),
      );
      await expect(client.createCart()).resolves.toBeNull();
      await expect(client.getCart()).resolves.toBeNull();
      await expect(client.addCartItems([{ sku: 'S', quantity: 1 }])).resolves.toBeNull();
      await expect(client.removeCartItems(['CI_1'])).resolves.toBeNull();
      await expect(client.setCountryCodeForCart('NL')).resolves.toBeNull();
      await expect(client.addCouponToCart('X')).resolves.toBeNull();
      await expect(client.removeCouponFromCart('X')).resolves.toBeNull();
      await expect(client.confirmCart()).resolves.toBeNull();
    });

    it('wishlist mutations & queries return null', async () => {
      seedWishlist();
      const client = createTestClient();
      server.use(
        mockOperation('CreateWishlist', { createWishlist: {} }),
        mockOperation('GetWishlist', {}),
        mockOperation('UpdateWishlist', { updateWishlist: {} }),
        mockOperation('DeleteWishlist', { deleteWishlist: {} }),
        mockOperation('AddItemToWishlist', { addItemToWishlist: {} }),
        mockOperation('RemoveItemFromWishlist', { removeItemFromWishlist: {} }),
      );
      await expect(client.createWishlist()).resolves.toBeNull();
      await expect(client.getWishlist()).resolves.toBeNull();
      await expect(client.updateWishlist({ label: 'x', expiresAt: 0 })).resolves.toBeNull();
      await expect(client.deleteWishlist()).resolves.toBeNull();
      await expect(client.addWishlistItem({ sku: 'S', quantity: 1, expiresAt: 0 })).resolves.toBeNull();
      await expect(client.removeWishlistItem('S', wishlistSnakeCase.token)).resolves.toBeNull();
    });

    it('product viewing history mutations & queries return null', async () => {
      seedPvh();
      const client = createTestClient();
      server.use(
        mockOperation('CreateProductViewingHistory', { createProductViewingHistory: {} }),
        mockOperation('GetProductViewingHistory', {}),
        mockOperation('UpdateProductViewingHistory', { updateProductViewingHistory: {} }),
        mockOperation('DeleteProductViewingHistory', { deleteProductViewingHistory: {} }),
        mockOperation('AddItemToProductViewingHistory', { addItemToProductViewingHistory: {} }),
      );
      await expect(client.createProductViewingHistory()).resolves.toBeNull();
      await expect(client.getProductViewingHistory(undefined as unknown as string)).resolves.toBeNull();
      await expect(client.updateProductViewingHistory({ label: 'x', expiresAt: 0 })).resolves.toBeNull();
      await expect(client.deleteProductViewingHistory(undefined as unknown as string)).resolves.toBeNull();
      await expect(
        client.addProductViewingHistoryItem(
          { sku: 'S', expiresAt: 0, viewedAt: 0 },
          undefined as unknown as string,
        ),
      ).resolves.toBeNull();
    });

    it('public order/channel/stock lookups return null', async () => {
      const client = createTestClient();
      server.use(
        mockOperation('GetOrder', {}),
        mockOperation('GetChannel', {}),
        mockOperation('CreateStockUpdateSubscriptionMutation', {}),
        mockOperation('ApproveStockUpdateSubscriptionMutation', {}),
        mockOperation('RemoveStockUpdateSubscriptionMutation', {}),
      );
      await expect(client.getOrder('OR_1')).resolves.toBeNull();
      await expect(client.getChannel()).resolves.toBeNull();
      await expect(client.createStockUpdateSubscription({ email: 'a', sku: 'S' })).resolves.toBeNull();
      await expect(client.approveStockUpdateSubscription('T')).resolves.toBeNull();
      await expect(client.removeStockUpdateSubscription('T')).resolves.toBeNull();
    });

    it('account queries fall back to null / empty collections', async () => {
      const { client } = createSignedInClient();
      server.use(
        mockOperation('GetAccountInformation', {}),
        mockOperation('GetAccountOrder', {}),
        mockOperation('GetAccountOutstandingOrders', {}),
        mockOperation('GetAccountProjects', {}),
        mockOperation('UpdateOrganisationOnAccountMutation', {}),
        mockOperation('Reorder', {}),
        mockOperation('UpdateAccountInformationMutation', {}),
      );
      await expect(client.getAccountInformation()).resolves.toBeNull();
      await expect(client.getAccountOrder('OR_1')).resolves.toBeNull();
      await expect(client.getAccountOutstandingOrders()).resolves.toEqual({ orders: [] });
      await expect(client.getAccountProjects()).resolves.toEqual({ projects: {} });
      await expect(
        client.updateOrganisationOnAccount(
          {} as Parameters<typeof client.updateOrganisationOnAccount>[0],
        ),
      ).resolves.toBeNull();
      await expect(client.reorderAccountOrder({ orderId: 'OR_1' })).resolves.toBeNull();
      await expect(client.updateAccountInformation({})).resolves.toBeNull();
    });

    it('organisation membership mutations fall back to empty user lists', async () => {
      const { client } = createSignedInClient();
      server.use(
        mockOperation('GetAccountOrganisationUsers', {}),
        mockOperation('InviteUserToAccountOrganisation', {}),
        mockOperation('UpdateContactRoleInOrganisationMutation', {}),
        mockOperation('RemoveUserFromAccountOrganisation', {}),
      );
      await expect(client.getAccountOrganisationUsers()).resolves.toEqual({ users: [] });
      await expect(
        client.inviteUserToAccountOrganisation({ organisationId: 'O', user: { email: 'a', role: 'user' } }),
      ).resolves.toEqual({ users: [] });
      await expect(
        client.updateUserRoleInAccountOrganisation({ organisationId: 'O', userId: 'U', role: 'user' }),
      ).resolves.toEqual({ users: [] });
      await expect(
        client.removeUserFromAccountOrganisation({ organisationId: 'O', userId: 'U' }),
      ).resolves.toEqual({ users: [] });
    });

    it('rma queries & mutations fall back to null / empty collections', async () => {
      const { client } = createSignedInClient();
      server.use(
        mockOperation('GetAccountRma', { }),
        mockOperation('CreateAccountRma', { createRma: {} }),
        mockOperation('CreateAccountRmaWithItems', { createRmaItems: {} }),
        mockOperation('UpdateAccountRma', { updateRma: {} }),
        mockOperation('DeleteAccountRma', { deleteRma: {} }),
        mockOperation('CreateAccountRmaItems', { createRmaItems: {} }),
        mockOperation('DeleteAccountRmaItems', { deleteRmaItems: {} }),
        mockOperation('UpdateAccountRmaItems', { updateRmaItems: {} }),
        mockOperation('SearchAccountRmaItems', {}),
      );
      await expect(client.getAccountRma('R')).resolves.toBeNull();
      await expect(client.createAccountRma({ contactId: 'C' })).resolves.toBeNull();
      await expect(
        client.createAccountRma({ items: [{ orderId: 'O', sku: 'S' }] }),
      ).resolves.toBeNull();
      await expect(client.updateAccountRma({ id: 'R' })).resolves.toBeNull();
      await expect(client.deleteAccountRma('R')).resolves.toBe(false);
      await expect(client.createAccountRmaItems({ rmaId: 'R', items: [] })).resolves.toBeNull();
      await expect(client.deleteAccountRmaItems({ rmaId: 'R', items: [] })).resolves.toBeNull();
      await expect(client.updateAccountRmaItems({ rmaId: 'R', items: [] })).resolves.toBeNull();
      await expect(client.searchAccountRmaItems()).resolves.toEqual({ items: [], pageInfo: {} });
    });

    it('auth methods fall back on empty responses', async () => {
      server.use(
        mockOperation('ChangePasswordMutation', {}),
        mockOperation('RequestPasswordResetMutation', {}),
        mockOperation('ResetPasswordMutation', {}),
      );
      const { client } = createSignedInClient();
      await expect(client.changePassword({ password: 'a', newPassword: 'b' })).resolves.toBe(false);
      await expect(client.requestPasswordReset({ email: 'a' })).resolves.toBe(false);
      // Shares the RequestPasswordResetMutation op name; empty response → false.
      await expect(client.requestUserVerification({ email: 'a' })).resolves.toBe(false);
      await expect(client.resetPassword({ token: 't', password: 'p' })).resolves.toBe(false);
    });

    it('token-issuing auth methods reject when the wrapper is missing', async () => {
      const { client } = createSignedInClient();
      server.use(
        mockOperation('SignInMutation', {}),
        mockOperation('SignUpMutation', {}),
        mockOperation('VerifyUserMutation', {}),
        mockOperation('SignInAsOrganisation', {}),
        mockOperation('SignOutOfOrganisation', {}),
      );
      await expect(client.signIn({ email: 'a', password: 'b' })).rejects.toBe('Invalid user token');
      await expect(
        client.signUp({ email: 'a', password: 'b', givenName: 'A', familyName: 'B' }),
      ).rejects.toBe('Invalid user token');
      await expect(client.verifyUser({ token: 't' })).rejects.toBe('Invalid user token');
      await expect(client.signInAsOrganisation({ organisationId: 'O' })).rejects.toBe('Invalid user token');
      await expect(client.signOutOfOrganisation()).rejects.toBe('Invalid user token');
    });
  });

  // --- B. Methods called without their optional input ---------------------
  describe('methods called without input arguments', () => {
    it('input-taking wrappers default their input to {}', async () => {
      const { client } = createSignedInClient();
      server.use(
        mockOperation('ChangePasswordMutation', {
          setPasswordForAccount: { account: { email: 'a@b.c' } },
        }),
        mockOperation('UpdateAccountInformationMutation', { updateAccount: { account: { id: 'A' } } }),
        mockOperation('UpdateOrganisationOnAccountMutation', {
          updateOrganisationOnAccount: { account: { id: 'A' } },
        }),
        mockOperation('InviteUserToAccountOrganisation', {
          addContactToAccountOrganisation: { organisation: { sharedContacts: [] } },
        }),
        // The "...RmaItems" supersets must be registered BEFORE the bare
        // "...Rma" ops: MSW checks handlers in registration order (first match
        // wins) and the bare name is a substring of the superset name.
        mockOperation('CreateAccountRmaItems', { createRmaItems: { rma: { id: 'R' } } }),
        mockOperation('DeleteAccountRmaItems', { deleteRmaItems: { rma: { id: 'R' } } }),
        mockOperation('UpdateAccountRmaItems', { updateRmaItems: { rma: { id: 'R' } } }),
        mockOperation('CreateAccountRma', { createRma: { rma: { id: 'R' } } }),
        mockOperation('UpdateAccountRma', { updateRma: { rma: { id: 'R' } } }),
      );
      // @ts-expect-error exercising the input || {} default
      await expect(client.changePassword()).resolves.toBe(true);
      // @ts-expect-error exercising the input || {} default
      await expect(client.updateAccountInformation()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default
      await expect(client.updateOrganisationOnAccount()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default
      await expect(client.updateAccountRma()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default
      await expect(client.createAccountRmaItems()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default
      await expect(client.deleteAccountRmaItems()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default
      await expect(client.updateAccountRmaItems()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default (user?.role?.toUpperCase() || 'USER')
      await expect(client.inviteUserToAccountOrganisation()).resolves.toEqual({ users: [] });
      await expect(client.createAccountRma()).resolves.toBeTruthy();
    });

    it('auth & organisation wrappers default their input to {}', async () => {
      const { client } = createSignedInClient();
      const token = validUserToken();
      server.use(
        // requestPasswordReset and requestUserVerification share this op name.
        mockOperation('RequestPasswordResetMutation', {
          requestCustomerPasswordReset: { is_successful: true },
          requestCustomerVerificationLink: { is_successful: true },
        }),
        mockOperation('ResetPasswordMutation', { resetCustomerPassword: { is_successful: true } }),
        mockOperation('SignInMutation', { logInCustomer: { token } }),
        mockOperation('SignUpMutation', { registerCustomer: { token } }),
        mockOperation('VerifyUserMutation', { verifyCustomer: { token } }),
        mockOperation('SignInAsOrganisation', { logInAsOrganisation: { token } }),
        mockOperation('UpdateContactRoleInOrganisationMutation', {
          updateContactRoleInOrganisation: { organisation: { sharedContacts: [] } },
        }),
        mockOperation('RemoveUserFromAccountOrganisation', {
          removeContactFromAccountOrganisation: { organisation: { sharedContacts: [] } },
        }),
      );
      // @ts-expect-error exercising the input || {} default
      await expect(client.requestPasswordReset()).resolves.toBe(true);
      // @ts-expect-error exercising the input || {} default
      await expect(client.requestUserVerification()).resolves.toBe(true);
      // @ts-expect-error exercising the input || {} default
      await expect(client.resetPassword()).resolves.toBe(true);
      // @ts-expect-error exercising the input || {} default
      await expect(client.signIn()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default
      await expect(client.signUp()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default
      await expect(client.verifyUser()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default
      await expect(client.signInAsOrganisation()).resolves.toBeTruthy();
      // @ts-expect-error exercising the input || {} default
      await expect(client.updateUserRoleInAccountOrganisation()).resolves.toEqual({ users: [] });
      // @ts-expect-error exercising the input || {} default
      await expect(client.removeUserFromAccountOrganisation()).resolves.toEqual({ users: [] });
    });
  });

  // --- C. Config variants & ternary arms ----------------------------------
  describe('config variants & ternary arms', () => {
    it('applies the cookie domain option at construction', () => {
      // Setting `domain` exercises the `config.domain ? {domain} : {}` arm in
      // the cookie-options builder. localStorage is used for the round-trip
      // because a domain-scoped cookie is not readable back under jsdom.
      const client = createTestClient({ domain: 'example.com' });
      client.storeCartTokenInStorage('CA_dom');
      expect(client.getCartTokenFromStorage()).toBe('CA_dom');
    });

    it('confirmCart forwards success and failure return urls', async () => {
      seedCart();
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('ConfirmCart', { confirmCart: { order: { id: 'OR_1' } } }, info => {
          variables = info.variables;
        }),
      );
      const client = createTestClient();
      await client.confirmCart(undefined, {
        checkout: { successReturnUrl: 'https://ok', failureReturnUrl: 'https://no' },
      } as Parameters<typeof client.confirmCart>[1]);
      const input = variables?.confirm_cart_input as Record<string, unknown>;
      const checkout = input.checkout as Record<string, unknown>;
      expect(checkout.success_return_url).toBe('https://ok');
      expect(checkout.failure_return_url).toBe('https://no');
    });

    it('createCart sends no session id when auto-generation is off', async () => {
      let variables: Record<string, unknown> | undefined;
      server.use(
        mockOperation('CreateCart', { createCart: { cart: cartSnakeCase } }, info => {
          variables = info.variables;
        }),
      );
      const client = createTestClient({ autoGenerateSessionID: false });
      await client.createCart();
      const input = variables?.cart_input as Record<string, unknown>;
      expect(input.session_id).toBeUndefined();
    });

    it('wishlist token round-trips through sessionStorage', () => {
      const client = createTestClient({ wishlistTokenStorageType: 'sessionStorage' });
      client.storeWishlistTokenInStorage('WL_s');
      expect(client.getWishlistTokenFromStorage()).toBe('WL_s');
      client.removeWishlistTokenFromStorage();
      expect(client.getWishlistTokenFromStorage()).toBeNull();
    });

    it('product viewing history token round-trips through sessionStorage', () => {
      const client = createTestClient({ productViewingHistoryTokenStorageType: 'sessionStorage' });
      client.storeProductViewingHistoryTokenInStorage('PVH_s');
      expect(client.getProductViewingHistoryTokenFromStorage()).toBe('PVH_s');
      client.removeProductViewingHistoryTokenFromStorage();
      expect(client.getProductViewingHistoryTokenFromStorage()).toBeNull();
    });

    it('getUser fills organisation defaults when name/role are absent', () => {
      Cookies.set(
        USER_TOKEN_COOKIE_KEY,
        makeUserJwt({ sub: 'CU_1', exp: oneHourFromNow(), organisation_id: 'OR_1' }),
      );
      const client = createTestClient();
      expect(client.getUser()?.organisation).toEqual({ id: 'OR_1', name: '', role: 'user' });
    });

    it('getUser returns a null organisation when the token has none', () => {
      Cookies.set(USER_TOKEN_COOKIE_KEY, makeUserJwt({ sub: 'CU_1', exp: oneHourFromNow() }));
      const client = createTestClient();
      expect(client.getUser()?.organisation).toBeNull();
    });

    it('queryAccount sends an empty bearer token when not signed in', async () => {
      let captured: Request | undefined;
      server.use(
        mockOperation('Ping', { ping: { ok: true } }, info => {
          captured = info.request;
        }),
      );
      const client = createTestClient();
      await client.queryAccount('query Ping { ping { ok } }');
      // The empty user token yields "Bearer " which fetch trims to "Bearer".
      expect(captured?.headers.get('authorization')).toBe('Bearer');
    });
  });

  // --- D. autoCreate returns null & transport-level recovery --------------
  describe('autoCreate returning null and network-error recovery', () => {
    it('addCartItems proceeds when auto-created cart is null', async () => {
      const ops: string[] = [];
      server.use(
        mockOperation('CreateCart', { createCart: { cart: null } }, () => ops.push('CreateCart')),
        mockOperation('AddItemsToCart', { addItemsToCart: { cart: cartSnakeCase } }, () =>
          ops.push('AddItemsToCart'),
        ),
      );
      const client = createTestClient();
      const cart = await client.addCartItems([{ sku: 'S', quantity: 1 }]);
      expect(ops).toEqual(['CreateCart', 'AddItemsToCart']);
      expect(cart?.id).toBe(cartSnakeCase.id);
    });

    it('addWishlistItem proceeds when auto-created wishlist is null', async () => {
      server.use(
        mockOperation('CreateWishlist', { createWishlist: { wishlist: null } }),
        mockOperation('AddItemToWishlist', { addItemToWishlist: { wishlist: wishlistSnakeCase } }),
      );
      const client = createTestClient();
      const wishlist = await client.addWishlistItem({ sku: 'S', quantity: 1, expiresAt: 0 });
      expect(wishlist?.token).toBe(wishlistSnakeCase.token);
    });

    it('addProductViewingHistoryItem proceeds when auto-created history is null', async () => {
      server.use(
        mockOperation('CreateProductViewingHistory', { createProductViewingHistory: { productViewingHistory: null } }),
        mockOperation('AddItemToProductViewingHistory', {
          addItemToProductViewingHistory: { productViewingHistory: productViewingHistorySnakeCase },
        }),
      );
      const client = createTestClient();
      const history = await client.addProductViewingHistoryItem(
        { sku: 'S', expiresAt: 0, viewedAt: 0 },
        undefined as unknown as string,
      );
      expect(history?.token).toBe(productViewingHistorySnakeCase.token);
    });

    it('recovers from a transport-level error without a GraphQL response', async () => {
      seedCart();
      server.use(mockNetworkError('GetCart'));
      const client = createTestClient();
      // No response.errors present → the errors || [] fallback runs; not a 404,
      // so the token is kept and getCart resolves null.
      await expect(client.getCart()).resolves.toBeNull();
      expect(localStorage.getItem(CART_TOKEN_STORAGE_KEY)).toBe(cartSnakeCase.id);
    });

    it('getWishlist recovers from a transport-level error', async () => {
      seedWishlist();
      server.use(mockNetworkError('GetWishlist'));
      const client = createTestClient();
      await expect(client.getWishlist()).resolves.toBeNull();
      expect(localStorage.getItem(WISHLIST_TOKEN_STORAGE_KEY)).toBe(wishlistSnakeCase.token);
    });

    it('getProductViewingHistory recovers from a transport-level error', async () => {
      seedPvh();
      server.use(mockNetworkError('GetProductViewingHistory'));
      const client = createTestClient();
      await expect(
        client.getProductViewingHistory(undefined as unknown as string),
      ).resolves.toBeNull();
      expect(localStorage.getItem(PVH_KEY)).toBe(productViewingHistorySnakeCase.token);
    });

    it('signIn is a public request using the storefront token', async () => {
      let captured: Request | undefined;
      server.use(
        mockOperation('SignInMutation', { logInCustomer: { token: validUserToken() } }, info => {
          captured = info.request;
        }),
      );
      const client = createTestClient();
      await client.signIn({ email: 'a', password: 'b' });
      expect(captured?.headers.get('authorization')).toBe(`Bearer ${STOREFRONT_TOKEN}`);
    });
  });
});
