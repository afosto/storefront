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
