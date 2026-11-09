// Type test against the emitted declarations (dist/index.d.ts), checked by `pnpm build`.
import {
  createStorefrontClient,
  gql,
  CoreCartFragment,
  getCartQuery,
  type StorefrontClientOptions,
} from '@afosto/storefront';

const options = { storefrontToken: 'token' } satisfies StorefrontClientOptions;
const client = createStorefrontClient(options);

client.getCart() satisfies Promise<unknown>;
client.getUser() satisfies { id: string } | null;
gql`
  query {
    channel {
      id
    }
  }
` satisfies string;
CoreCartFragment satisfies string;
getCartQuery satisfies string;

// The cookie options keep the js-cookie types, they must not become `any`.
createStorefrontClient({
  storefrontToken: 'token',
  cartTokenCookieOptions: { sameSite: 'lax', expires: 7 },
});
createStorefrontClient({
  storefrontToken: 'token',
  cartTokenCookieOptions: {
    // @ts-expect-error sameSite only accepts the known values
    sameSite: 'nope',
  },
});
