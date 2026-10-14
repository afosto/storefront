import { graphql, HttpResponse, type GraphQLHandler } from 'msw';

/**
 * The only network boundary in the library: the default GraphQL endpoint of
 * `@afosto/graphql-client`. Every request the client makes goes here, so all
 * mocking happens on this single endpoint.
 */
export const GRAPHQL_ENDPOINT = 'https://afosto.app/graphql';

const link = graphql.link(GRAPHQL_ENDPOINT);

/**
 * Match an operation by substring on the query text. Operation names are used
 * as labels here, so a shorter name (e.g. `CreateAccountRma`) also matches a
 * longer operation that contains it (`CreateAccountRmaItems`). When several
 * such names are registered in one test, order the handlers so the more
 * specific name is registered first (MSW checks handlers in registration
 * order, first match wins).
 */
const matchesOperation = (operationName: string, query: string): boolean =>
  query.includes(operationName);

export interface GraphQLError {
  message?: string;
  extensions?: { status?: number; [key: string]: unknown };
  [key: string]: unknown;
}

/**
 * Build a handler that answers a named GraphQL operation with a data payload.
 * Fixtures are provided in `snake_case`; the `@afosto/graphql-client`
 * conversion layer turns the response into `camelCase` before it reaches the
 * client, so assertions expect `camelCase`.
 *
 * The optional `onRequest` callback receives the parsed request so tests can
 * assert on variables and the `Authorization` header.
 */
export const mockOperation = (
  operationName: string,
  data: Record<string, unknown>,
  onRequest?: (info: { variables: Record<string, unknown>; request: Request }) => void,
): GraphQLHandler =>
  link.operation(({ query, variables, request }) => {
    if (!matchesOperation(operationName, query)) {
      return undefined;
    }

    onRequest?.({ variables, request });

    return HttpResponse.json({ data });
  });

/**
 * Build a handler that answers a named GraphQL operation with GraphQL errors.
 * Pass `extensions.status === 404` to simulate a reference the server no longer
 * knows (cart/wishlist/history token), which the client detects and recovers
 * from.
 */
export const mockOperationError = (
  operationName: string,
  errors: GraphQLError[],
  onRequest?: (info: { variables: Record<string, unknown>; request: Request }) => void,
): GraphQLHandler =>
  link.operation(({ query, variables, request }) => {
    if (!matchesOperation(operationName, query)) {
      return undefined;
    }

    onRequest?.({ variables, request });

    return HttpResponse.json({ errors });
  });

/**
 * Build a handler that fails a named GraphQL operation with a transport-level
 * network error (no GraphQL `response.errors`). Used to exercise the recovery
 * paths where `error?.response` is absent.
 */
export const mockNetworkError = (operationName: string): GraphQLHandler =>
  link.operation(({ query }) => {
    if (!matchesOperation(operationName, query)) {
      return undefined;
    }

    return HttpResponse.error();
  });

export type OperationStep = { data: Record<string, unknown> } | { errors: GraphQLError[] };

/**
 * Build a single handler that answers a named GraphQL operation with a
 * sequence of responses — the first call gets `steps[0]`, the next `steps[1]`,
 * and so on (the last step repeats once exhausted). Needed for recovery paths
 * where the same operation first fails with a 404 and then succeeds after the
 * token has been recreated.
 */
export const mockOperationSequence = (
  operationName: string,
  steps: OperationStep[],
): GraphQLHandler => {
  let index = 0;

  return link.operation(({ query }) => {
    if (!matchesOperation(operationName, query)) {
      return undefined;
    }

    const step = steps[Math.min(index, steps.length - 1)];
    index += 1;

    return HttpResponse.json(step);
  });
};
