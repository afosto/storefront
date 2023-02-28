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

# Install with NPM
npm install @afosto/storefront
```

### Browser

This library supports the **last two** versions of major browsers (Chrome, Edge, Firefox, Safari).

```html
<script src="https://cdn.jsdelivr.net/npm/@afosto/storefront@latest/dist/umd/afosto-storefront.min.js"></script>
```


## Get started

### ES6

```js
import StorefrontClient from '@afosto/storefront';

const client = StorefrontClient({
  storefrontToken: 'STOREFRONT_TOKEN',
});
```

### CJS

```js
const StorefrontClient = require('@afosto/storefront');

const client = StorefrontClient({
  storefrontToken: 'STOREFRONT_TOKEN',
});
```

### Browser

```html
<script>
    // Make sure you've added the afosto-storefront script (See installation). 
    // Use the code below to initialize the storefront client after the script has been loaded.
    
    const client = afostoStorefront.Client({
      storefrontToken: 'STOREFRONT_TOKEN'
    });
</script>
```

## Configuration

If you would like to use the client with other configuration than the default configuration.

| Option                         | Description                                                                                                                                                                                                                         | Default             |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| storefrontToken (**required**) | This is the token being used for authentication with the Afosto GraphQL storefront.                                                                                                                                                 |                     |
| autoCreateCart | Whether to automatically create a cart when adding an item if there is no cart.                                                                                                                                                     | true                |                      
| graphQLClientOptions | The <a href="https://www.npmjs.com/package/@afosto/graphql-client#user-content-custom-configuration">options</a> that are provided to the <a href="https://www.npmjs.com/package/@afosto/graphql-client">Afosto GraphQL client</a>. | {}                  |                      
| storeCartToken | Whether to store the cart token in web storage.                                                                                                                                                                                     | true                |                      |
| storageKeyPrefix | The prefix used for storing storefront information in web storage.                                                                                                                                                                  | 'afosto.storefront' |
| storageType | The type of storage you would like to use for storing storefront information 'localStorage' or 'sessionStorage'.                                                                                                                    | 'localStorage'      |

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

### Create cart manually

```js
// Create a new cart manually.

const cart = await client.createCart();
```

## Custom queries / mutations

You can also write your own queries and mutations. For the available fields, queries and mutations you can check the <a href="https://afosto.app/graphql">Afosto GraphQL storefront</a>.

```js
// ES6 import
import { gql } from '@afosto/storefront';

// CJS import
const { gql } = require('@afosto/storefront');

// Browser
const gql = afostoStorefront.gql;


// Write your query / mutation
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

// Execute the query / mutation
const response = await client.query(query, variables);
```



