<p align="center">
  <a href="https://afosto.com"><img src="https://content.afosto.io/5719193282412544/brand/AFO-Logo-compleet-kleur-RGBat4x.png?w=268" alt="Afosto" /></a>
</p>

<h1 align="center">Afosto Storefront Client</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@afosto/storefront"><img src="https://img.shields.io/npm/v/@afosto/storefront.svg" alt="npm version"></a>
  <a href="https://github.com/afosto/storefront/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-informational" alt="License"></a>
</p>

<p align="center">This library provides a JS client which communicates with the <a href="https://afosto.app/graphql">Afosto GraphQL storefront</a>.


## Installation

### Yarn / PNPM / NPM

Install with Yarn
```sh
yarn add @afosto/storefront
```
Install with PNPM
```sh
pnpm add @afosto/storefront
```
Install with NPM
```sh
npm install @afosto/storefront
```

## Get started

### ES6

```js
import { createStorefrontClient } from '@afosto/storefront';

const client = createStorefrontClient({
  storefrontToken: 'STOREFRONT_TOKEN',
});
```

### CJS

```js
const { createStorefrontClient } = require('@afosto/storefront');

const client = createStorefrontClient({
  storefrontToken: 'STOREFRONT_TOKEN',
});
```

### Browser

Use an ESM CDN like https://esm.sh

```html
<script type="module">
  import { createStorefrontClient } from 'https://esm.sh/@afosto/storefront@3';
    
  const client = createStorefrontClient({
    storefrontToken: 'STOREFRONT_TOKEN'
  });
</script>
```

## Configuration

If you would like to use the client with other configuration than the default configuration.

| Option                         | Description                                                                                                                                                                                                                         | Default        |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| storefrontToken (**required**) | This is the token being used for authentication with the Afosto GraphQL storefront.                                                                                                                                                 |                |
| autoCreateCart                 | Whether to automatically create a cart when adding an item if there is no cart.                                                                                                                                                     | true           |                      
| autoGenerateSessionID          | Whether to automatically generate a session ID for the storefront client.                                                                                                                                                           | true           |                      
| cartTokenStorageType           | The type of storage you would like to use for storing the cart token `localStorage`, `sessionStorage` or `cookie`.                                                                                                                  | 'localStorage' |
| domain                         | The domain for which the user token should be stored. Can be used to share the user token across sub domains. Defaults to current domain.                                                                                           |                |
| graphQLClientOptions           | The <a href="https://www.npmjs.com/package/@afosto/graphql-client#user-content-custom-configuration">options</a> that are provided to the <a href="https://www.npmjs.com/package/@afosto/graphql-client">Afosto GraphQL client</a>. | {}             |                      
| storeCartToken                 | Whether to store the cart token in web storage.                                                                                                                                                                                     | true           |
| cartTokenCookieOptions         | Customize the options used for the cart token cookie. Only applicable when `cartTokenStorageType` is set to `cookie`.                                                                                                               | {}             |
| storeUserToken                 | Whether to store the user token in a cookie.                                                                                                                                                                                        | true           |
| userTokenCookieOptions         | Customize the options used for the user token cookie.                                                                                                                                                                               | {}             |
| storageKeyPrefix               | The prefix used for storing storefront information in web storage.                                                                                                                                                                  | 'af-'          |

## Examples

Before using these examples check the **Get started** section how to initialize the client.

### Create cart

Use this when you manually want to create a new cart.

Fetch the cart information if a cart exists. Returns null when no cart exists.
```js
const cart = await client.getCart();
```

### Get cart information

 Fetch the cart information if a cart exists. Returns null when no cart exists.

```js
const cart = await client.getCart();
```

### Add items to cart
Add one or multiple items to the existing cart. 
If the autoCreateCart option is true, it will create a new cart when a cart doesn't exist yet.

```js
const cart = await client.addCartItems([
  {
    sku: 'sku-123',
    quantity: 1,
  },
]);
```

### Remove items from the cart

Remove items from the cart by item ids. 

```js
const cart = await client.removeCartItems(['item-id-1', 'item-id-2']);
```

### Add coupon code to the cart

Add a coupon code to the cart.

```js
const cart = await client.addCouponToCart('my-coupon-code');
```

### Remove coupon code from the cart

Remove a coupon code from the cart.

```js
const cart = await client.removeCouponFromCart('my-coupon-code');
```

### Set the alpha-2 country code on the cart

Set the alpha-2 country code for the cart.

```js
const cart = await client.setCountryCodeForCart('US');
```

### Create an order by confirming the cart

Confirm the cart which creates an order.

```js
const order = await client.confirmCart();
```

### Get order information

Fetch order information for an order ID. Returns null when the order doesn't exist.

```js
const order = await client.getOrder('order-id');
```

### Get channel information

Fetch channel information. Returns null when the channel doesn't exist.

```js
const channel = await client.getChannel();
```

### Sign in

```js
const user = await client.signIn({
  email: 'johndoe@example.com',
  password: '******',
});
```

### Sign in as organisation

Sign in as an organisation that has been shared with your account. This requires a default sign in first.

```js
const user = await client.signInAsOrganisation({
  organisationId: 'organisation-id'
});
```

### Sign out

```js
client.signOut();
```

### Sign out of organisation

Sign out of an organisation to go back to the users account.

```js
const user = await client.signOutOfOrganisation();
```

### Sign up

You can also optionally provide a phone number, billing address and shipping address.

```js
const user = await client.signUp({
  givenName: 'John',
  additionalName: '',
  familyName: 'Doe',
  email: 'johndoe@example.com',
  password: '******',
});
```

### Get current user

Get the current user information or null when the user isn't signed in.

```js
const user = client.getUser();
```

### Request password reset

This will send a password reset email to the provided email address.

```js
const isSuccessful = await client.requestPasswordReset({
  email: 'johndoe@example.com',
});
```

### Reset password

Provide the reset password token and the new password.

```js
const isSuccessful = await client.resetPassword({
  token: 'reset-password-token',
  newPassword: '********',
});
```

### Request user verification

This will send a verification email to the provided email address.

```js
const isSuccessful = await client.requestUserVerification({
  email: 'johndoe@example.com',
});
```

### Verify user

Verify the user by providing a verification token.

```js
const user = await client.verifyUser({
  token: 'verification-token',
});
```

### Change password

Change the password for the user that's signed in.
The password field is the current password.

```js
const user = await client.changePassword({
  password: '******',
  newPassword: '********',
});
```

### Get account information

Get the account information for the user that's signed in.

```js
const account = await client.getAccountInformation();
```

### Update account information

Update the account information for the user that's signed in.
You only have to provide the information that you would like to update.

```js
const account = await client.updateAccountInformation({
  email: 'janedoe@example.com',
  givenName: 'Jane',
  additionalName: '',
  familyName: 'Doe',
});
```

### List account orders

Get all account orders from the user that's signed in.

```js
const { orders, pageInfo } = await client.getAccountOrders();
```

### Get account order

Get a specific account order by ID.

```js
const order = await client.getAccountOrder('order-id');
```

### Reorder a previous account order

Create a new cart from an existing order in an account.
Optionally you can pass in an ID to create the new cart with. 

```js
const order = await client.reorderAccountOrder({
  orderId: 'order-id',
  cartId: 'cart-id',
});
```

### List account projects

Get all account projects from the user that's signed in.

```js
const { projects, pageInfo } = await client.getAccountProjects();
```

### Invite user to account organisation

Invite a user to get account access to your organisation.

```js
const { users } = await client.inviteUserToAccountOrganisation({
  organisationId: 'organisation-id',
  user: {
    email: 'johndoe@example.com',
    role: 'user',
  },
});
```

### Update a users role for account organisation

Update the role a user has for an account organisation.

```js
const { users } = await client.updateUserRoleInAccountOrganisation({
  organisationId: 'organisation-id',
  userId: 'user-id',
  role: 'admin',
});
```

### Remove user from account organisation

Remove a user with account access from your organisation.

```js
const { users } = await client.removeUserFromAccountOrganisation({
  organisationId: 'organisation-id',
  userId: 'user-id'
});
```

### List account organisation users

Get the users that have account access to your organisation.

```js
const { users } = await client.getAccountOrganisationUsers();
```

### Update information of account organisation 

Update the information of the organisation the user is signed in to.

```js
const account = await client.updateOrganisationOnAccount({
  id: 'organisation-id',
  name: 'My organisation',
});
```

### List Return Merchandise Authorizations (RMAS)

Get all Return Merchandise Authorizations (RMAS) for the user that's signed in.

```js
const { rmas, pageInfo } = await client.getAccountRmas();
```

### Get Return Merchandise Authorization (RMA)

Get a Return Merchandise Authorizations (RMA) for the user that's signed in.

```js
const rma = await client.getAccountRma('rma-id');
```

### Create a Return Merchandise Authorization (RMA)

Create a Return Merchandise Authorization (RMA) for the user that's signed in.

```js
const rma = await client.createAccountRma({
  channelId: 'channel-id',
});
```

### Delete a Return Merchandise Authorization (RMA)

Delete a Return Merchandise Authorization (RMA) for the user that's signed in.

```js
const isSuccessfull = await client.deleteAccountRma('rma-id');
```

### Update a Return Merchandise Authorization (RMA)

Update a Return Merchandise Authorization (RMA) for the user that's signed in.

```js
const rma = await client.updateAccountRma({
  id: 'rma-id',
  status: 'OPEN',
});
```

### Add items to a Return Merchandise Authorization (RMA)

Add items to a Return Merchandise Authorization (RMA) for the user that's signed in.

```js
const rma = await client.createAccountRmaItems({
  rmaId: 'rma-id',
  items: [
    {
      sku: 'sku-123',
      orderId: 'order-id',
      reason: 'DAMAGED',
      contactNote: 'There are scratches on it'
    }
  ],
});
```

### Delete items from a Return Merchandise Authorization (RMA)

Delete items from a Return Merchandise Authorization (RMA) for the user that's signed in.

```js
const rma = await client.deleteAccountRmaItems({
  rmaId: 'rma-id',
  items: ['rma-item-id-1', 'rma-item-id-2'],
});
```

### Update items on a Return Merchandise Authorization (RMA)

Update items on a Return Merchandise Authorization (RMA) for the user that's signed in.

```js
const rma = await client.updateAccountRmaItems({
  rmaId: 'rma-id',
  items: [
    {
      id: 'rma-item-id-1',
      reason: 'DAMAGED',
      contactNote: 'There are scratches on it'
    }
  ],
});
```

### Search for available Return Merchandise Authorization (RMA) items

Search for available items that can be added to a Return Merchandise Authorization (RMA) for the user that's signed in.

```js
const { items, pageInfo } = await client.searchAccountRmaItems({
  first: 20,
  after: 'next-page-token', // Can be empty for first page
  // If you need filters
  filters: {
    orderId: 'order-id',
    sku: 'sku-123',
  },
});
```


### Subscribe to stock updates

Get stock updates for the given SKU on the given email address.

```js
const order = await client.createStockUpdateSubscription({
  email: 'janedoe@example.com',
  sku: 'sku-123',
});
```

### Approve stock updates subscription

Approve a requested stock update subscription with a token.

```js
const order = await client.approveStockUpdateSubscription('87ff9149-dcca-4cd7-a154-b03c5cbf62c3');
```

### Remove stock updates subscriptions

Remove all stock update subscriptions for an email address with a token.

```js
const order = await client.removeStockUpdateSubscription('ef34c272-b1ee-41b3-9e07-01e792405747');
```

## Custom queries / mutations

You can also write your own queries and mutations. For the available fields, queries and mutations you can check the <a href="https://afosto.app/graphql">Afosto GraphQL storefront</a>.

### Storefront

For storefront related queries/mutations:
```js
// ES6 import
import { gql } from '@afosto/storefront';

// CJS import
const { gql } = require('@afosto/storefront');

// Browser
const gql = afostoStorefront.gql;


// Write your GQL query / mutation
const query = gql`
  query getCart($id: String!) {
    cart(id: $id) {
      subtotal
      total
      items {
        ids
        image
        label
        sku
      }
    }
  }
`;

// Define your variables
const variables = {
  id: 'my_cart_token',
};

// Execute the GQL query / mutation
const response = await client.query(query, variables);
```

### Account

For account related queries/mutations:
```js
// ES6 import
import { gql } from '@afosto/storefront';

// CJS import
const { gql } = require('@afosto/storefront');

// Browser
const gql = afostoStorefront.gql;


// Write your GQL query / mutation
const query = gql`
  query getAccount {
    account {
      email
      given_name
      additional_name
      family_name
    }
  }
`;

// Execute the GQL query / mutation
const response = await client.queryAccount(query);
```


