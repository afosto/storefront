import { describe, expect, it } from 'vitest';
import { server } from '../msw/server';
import { recordAllOperations } from '../msw/graphql';
import { STOREFRONT_TOKEN, createSignedInClient } from './helpers';

type Client = ReturnType<typeof createSignedInClient>['client'];
type Case = [method: string, operation: string, call: (client: Client) => Promise<unknown>];

/**
 * Which token each method sends. Storefront (public) methods must use the
 * storefront token; account methods must use the user token. Switching a
 * method between `request` and `authenticatedRequest` is caught here. Every
 * operation answers with empty data, so methods that then reject are fine.
 */
const storefrontCases: Case[] = [
  ['createCart', 'CreateCart', c => c.createCart()],
  ['getCart', 'GetCart', c => c.getCart('CA_1')],
  ['addCartItems', 'AddItemsToCart', c => c.addCartItems([{ sku: 'S', quantity: 1 }], 'CA_1')],
  ['removeCartItems', 'RemoveItemsFromCart', c => c.removeCartItems(['CI_1'], 'CA_1')],
  ['setCountryCodeForCart', 'setCountryCodeForCart', c => c.setCountryCodeForCart('NL', 'CA_1')],
  ['addCouponToCart', 'AddCouponToCart', c => c.addCouponToCart('X', 'CA_1')],
  ['removeCouponFromCart', 'RemoveCouponFromCart', c => c.removeCouponFromCart('X', 'CA_1')],
  ['confirmCart', 'ConfirmCart', c => c.confirmCart('CA_1')],
  ['getOrder', 'GetOrder', c => c.getOrder('OR_1')],
  ['getChannel', 'GetChannel', c => c.getChannel()],
  ['createWishlist', 'CreateWishlist', c => c.createWishlist()],
  ['getWishlist', 'GetWishlist', c => c.getWishlist('WL_1')],
  ['updateWishlist', 'UpdateWishlist', c => c.updateWishlist({ label: 'x', expiresAt: 1 }, 'WL_1')],
  ['deleteWishlist', 'DeleteWishlist', c => c.deleteWishlist('WL_1')],
  [
    'addWishlistItem',
    'AddItemToWishlist',
    c => c.addWishlistItem({ sku: 'S', quantity: 1, expiresAt: 1 }, 'WL_1'),
  ],
  ['removeWishlistItem', 'RemoveItemFromWishlist', c => c.removeWishlistItem('S', 'WL_1')],
  [
    'createProductViewingHistory',
    'CreateProductViewingHistory',
    c => c.createProductViewingHistory(),
  ],
  ['getProductViewingHistory', 'GetProductViewingHistory', c => c.getProductViewingHistory('P_1')],
  [
    'updateProductViewingHistory',
    'UpdateProductViewingHistory',
    c => c.updateProductViewingHistory({ label: 'x', expiresAt: 1 }, 'P_1'),
  ],
  [
    'deleteProductViewingHistory',
    'DeleteProductViewingHistory',
    c => c.deleteProductViewingHistory('P_1'),
  ],
  [
    'addProductViewingHistoryItem',
    'AddItemToProductViewingHistory',
    c => c.addProductViewingHistoryItem({ sku: 'S', expiresAt: 1, viewedAt: 1 }, 'P_1'),
  ],
  [
    'createStockUpdateSubscription',
    'CreateStockUpdateSubscriptionMutation',
    c => c.createStockUpdateSubscription({ email: 'a@b.c', sku: 'S' }),
  ],
  [
    'approveStockUpdateSubscription',
    'ApproveStockUpdateSubscriptionMutation',
    c => c.approveStockUpdateSubscription('T'),
  ],
  [
    'removeStockUpdateSubscription',
    'RemoveStockUpdateSubscriptionMutation',
    c => c.removeStockUpdateSubscription('T'),
  ],
  ['signIn', 'SignInMutation', c => c.signIn({ email: 'a', password: 'b' })],
  [
    'signUp',
    'SignUpMutation',
    c => c.signUp({ email: 'a', password: 'b', givenName: 'A', familyName: 'B' }),
  ],
  ['verifyUser', 'VerifyUserMutation', c => c.verifyUser({ token: 'T' })],
  [
    'requestPasswordReset',
    'RequestPasswordResetMutation',
    c => c.requestPasswordReset({ email: 'a' }),
  ],
  [
    'requestUserVerification',
    'RequestUserVerificationMutation',
    c => c.requestUserVerification({ email: 'a' }),
  ],
  ['resetPassword', 'ResetPasswordMutation', c => c.resetPassword({ token: 'T', password: 'p' })],
];

const userCases: Case[] = [
  [
    'changePassword',
    'ChangePasswordMutation',
    c => c.changePassword({ password: 'a', newPassword: 'b' }),
  ],
  [
    'updateAccountInformation',
    'UpdateAccountInformationMutation',
    c => c.updateAccountInformation({ givenName: 'A' }),
  ],
  [
    'signInAsOrganisation',
    'SignInAsOrganisation',
    c => c.signInAsOrganisation({ organisationId: 'O' }),
  ],
  ['signOutOfOrganisation', 'SignOutOfOrganisation', c => c.signOutOfOrganisation()],
  ['getAccountInformation', 'GetAccountInformation', c => c.getAccountInformation()],
  ['getAccountBalance', 'GetAccountBalance', c => c.getAccountBalance()],
  ['getAccountOrder', 'GetAccountOrder', c => c.getAccountOrder('OR_1')],
  ['getAccountOrders', 'GetAccountOrders', c => c.getAccountOrders()],
  [
    'getAccountOutstandingOrders',
    'GetAccountOutstandingOrders',
    c => c.getAccountOutstandingOrders(),
  ],
  ['getAccountProjects', 'GetAccountProjects', c => c.getAccountProjects()],
  ['reorderAccountOrder', 'Reorder', c => c.reorderAccountOrder({ orderId: 'OR_1' })],
  [
    'getAccountOrganisationUsers',
    'GetAccountOrganisationUsers',
    c => c.getAccountOrganisationUsers(),
  ],
  [
    'updateOrganisationOnAccount',
    'UpdateOrganisationOnAccountMutation',
    c => c.updateOrganisationOnAccount({} as Parameters<Client['updateOrganisationOnAccount']>[0]),
  ],
  [
    'inviteUserToAccountOrganisation',
    'InviteUserToAccountOrganisation',
    c =>
      c.inviteUserToAccountOrganisation({
        organisationId: 'O',
        user: { email: 'a', role: 'user' },
      }),
  ],
  [
    'updateUserRoleInAccountOrganisation',
    'UpdateContactRoleInOrganisationMutation',
    c => c.updateUserRoleInAccountOrganisation({ organisationId: 'O', userId: 'U', role: 'user' }),
  ],
  [
    'removeUserFromAccountOrganisation',
    'RemoveUserFromAccountOrganisation',
    c => c.removeUserFromAccountOrganisation({ organisationId: 'O', userId: 'U' }),
  ],
  ['createAccountRma', 'CreateAccountRma', c => c.createAccountRma({ contactId: 'C' })],
  [
    'createAccountRma (with items)',
    'CreateAccountRmaWithItems',
    c => c.createAccountRma({ items: [{ orderId: 'O', sku: 'S' }] }),
  ],
  ['getAccountRmas', 'GetAccountRmas', c => c.getAccountRmas()],
  ['getAccountRma', 'GetAccountRma', c => c.getAccountRma('R')],
  ['updateAccountRma', 'UpdateAccountRma', c => c.updateAccountRma({ id: 'R' })],
  ['deleteAccountRma', 'DeleteAccountRma', c => c.deleteAccountRma('R')],
  [
    'createAccountRmaItems',
    'CreateAccountRmaItems',
    c => c.createAccountRmaItems({ rmaId: 'R', items: [] }),
  ],
  [
    'deleteAccountRmaItems',
    'DeleteAccountRmaItems',
    c => c.deleteAccountRmaItems({ rmaId: 'R', items: [] }),
  ],
  [
    'updateAccountRmaItems',
    'UpdateAccountRmaItems',
    c => c.updateAccountRmaItems({ rmaId: 'R', items: [] }),
  ],
  ['searchAccountRmaItems', 'SearchAccountRmaItems', c => c.searchAccountRmaItems()],
];

describe('Authorization header routing', () => {
  const run = async (call: Case[2]) => {
    const { handler, requests } = recordAllOperations();
    server.use(handler);
    const { client, userToken } = createSignedInClient();

    await call(client).catch(() => undefined);

    return { requests, userToken };
  };

  it.each(storefrontCases)('%s sends %s with the storefront token', async (_m, operation, call) => {
    const { requests } = await run(call);

    expect(requests).toEqual([
      expect.objectContaining({
        operationName: operation,
        authorization: `Bearer ${STOREFRONT_TOKEN}`,
      }),
    ]);
  });

  it.each(userCases)('%s sends %s with the user token', async (_m, operation, call) => {
    const { requests, userToken } = await run(call);

    expect(requests).toEqual([
      expect.objectContaining({ operationName: operation, authorization: `Bearer ${userToken}` }),
    ]);
  });
});
