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

### Yarn / NPM

```sh
# Install with Yarn
yarn add @afosto/storefront

# Install with PNPM
pnpm add @afosto/storefront

# Install with NPM
npm install @afosto/storefront
```

### Browser

This library supports the **last two** versions of major browsers (Chrome, Edge, Firefox, Safari).

```html
<script src="https://cdn.jsdelivr.net/npm/@afosto/storefront@3/dist/umd/afosto-storefront.min.js"></script>
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

```html
<script>
    // Make sure you've added the afosto-storefront script (See installation). 
    // Use the code below to initialize the storefront client after the script has been loaded.
    
    const client = afostoStorefront.createStorefrontClient({
      storefrontToken: 'STOREFRONT_TOKEN'
    });
</script>
```

## Configuration

If you would like to use the client with other configuration than the default configuration.

| Option                         | Description                                                                                                                                                                                                                         | Default             |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| storefrontToken (**required**) | This is the token being used for authentication with the Afosto GraphQL storefront.                                                                                                                                                 |                     |
| autoCreateCart                 | Whether to automatically create a cart when adding an item if there is no cart.                                                                                                                                                     | true                |                      
| autoGenerateSessionID          | Whether to automatically generate a session ID for the storefront client.                                                                                                                                                           | true                |                      
| cartTokenStorageType           | The type of storage you would like to use for storing the cart token 'localStorage' or 'sessionStorage'.                                                                                                                            | 'localStorage'      |
| graphQLClientOptions           | The <a href="https://www.npmjs.com/package/@afosto/graphql-client#user-content-custom-configuration">options</a> that are provided to the <a href="https://www.npmjs.com/package/@afosto/graphql-client">Afosto GraphQL client</a>. | {}                  |                      
| graphQLClientOptions           | The <a href="https://www.npmjs.com/package/@afosto/graphql-client#user-content-custom-configuration">options</a> that are provided to the <a href="https://www.npmjs.com/package/@afosto/graphql-client">Afosto GraphQL client</a>. | {}                  |                      
| storeCartToken                 | Whether to store the cart token in web storage.                                                                                                                                                                                     | true                |                      |
| storeUserToken                 | Whether to store the user token in a cookie.                                                                                                                                                                                        | true                |                      |
| storageKeyPrefix               | The prefix used for storing storefront information in web storage.                                                                                                                                                                  | 'afosto.storefront' |

## Examples

Before using these examples check the **Get started** section how to initialize the client.

### Get cart information

```js
// Fetch the cart information if an cart exists. Returns null when no cart exists.

const cart = await client.getCart();
```

### Add items to cart

```js
// Add one or multiple items to the existing cart. 
// If the autoCreateCart option is true, it will create a new cart when a cart doesn't exist yet.

const cart = await client.addCartItems([
  {
    sku: 'sku-123',
    quantity: 1,
  },
]);
```

### Remove items from the cart

```js
// Remove items from the cart by item ids. 

const cart = await client.removeCartItems(['item_id_1', 'item_id_2']);
```

### Add coupon code to the cart

```js
// Add a coupon code to the cart.

const cart = await client.addCouponToCart('my-coupon-code');
```

### Remove coupon code from the cart

```js
// Add a coupon code to the cart.

const cart = await client.removeCouponFromCart('my-coupon-code');
```

### Set the alpha-2 country code on the cart

```js
// Set the alpha-2 country code for the cart.

const cart = await client.setCountryCodeForCart('US');
```

### Create an order by confirming the cart

```js
// Confirm the cart which creates an order.

const order = await client.confirmCart();
```

### Get order information

```js
// Fetch order information for an order ID. Returns null when the order doesn't exist.

const order = await client.getOrder('order_id');
```

### Get channel information

```js
// Fetch channel information. Returns null when the channel doesn't exist.

const channel = await client.getChannel();
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


