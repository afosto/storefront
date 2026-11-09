import { HttpResponse } from 'msw';
import { graphql, type GraphQLHandler } from 'msw/graphql';

/**
 * The only network boundary in the library: the default GraphQL endpoint of
 * `@afosto/graphql-client`. Every request the client makes goes here, so all
 * mocking happens on this single endpoint.
 */
export const GRAPHQL_ENDPOINT = 'https://afosto.app/graphql';

const link = graphql.link(GRAPHQL_ENDPOINT);

export interface GraphQLError {
  message?: string;
  extensions?: { status?: number; [key: string]: unknown };
  [key: string]: unknown;
}

export interface CapturedRequest {
  operationName: string;
  variables: Record<string, unknown>;
  authorization: string | null;
}

type OnRequest = (info: CapturedRequest) => void;

const capture = (
  operationName: string,
  variables: Record<string, unknown>,
  request: Request,
): CapturedRequest => ({
  operationName,
  variables,
  authorization: request.headers.get('authorization'),
});

/**
 * Answer a GraphQL operation (matched on its exact operation name) with a data
 * payload. Fixtures are `snake_case`; the `@afosto/graphql-client` conversion
 * layer turns the response into `camelCase` before it reaches the client, and
 * turns the client's `camelCase` variables into `snake_case` on the wire.
 */
export const mockOperation = (
  operationName: string,
  data: Record<string, unknown>,
  onRequest?: OnRequest,
): GraphQLHandler =>
  link.operation(({ operationName: name, variables, request }) => {
    if (name !== operationName) {
      return undefined;
    }

    onRequest?.(capture(name, variables, request));

    return HttpResponse.json({ data });
  });

/**
 * Answer a GraphQL operation with GraphQL errors. Pass `extensions.status ===
 * 404` to simulate a token the server no longer knows (cart/wishlist/history).
 */
export const mockOperationError = (
  operationName: string,
  errors: GraphQLError[],
  onRequest?: OnRequest,
): GraphQLHandler =>
  link.operation(({ operationName: name, variables, request }) => {
    if (name !== operationName) {
      return undefined;
    }

    onRequest?.(capture(name, variables, request));

    return HttpResponse.json({ errors });
  });

/**
 * Fail a GraphQL operation with a transport-level network error (no GraphQL
 * `response.errors`).
 */
export const mockNetworkError = (operationName: string): GraphQLHandler =>
  link.operation(({ operationName: name }) => {
    if (name !== operationName) {
      return undefined;
    }

    return HttpResponse.error();
  });

export type OperationStep = { data: Record<string, unknown> } | { errors: GraphQLError[] };

/**
 * Answer a GraphQL operation with a sequence of responses: the first call gets
 * `steps[0]`, the next `steps[1]`, and so on (the last step repeats once
 * exhausted). Used for recovery paths where an operation first 404s and then
 * succeeds after the token was recreated.
 */
export const mockOperationSequence = (
  operationName: string,
  steps: OperationStep[],
  onRequest?: OnRequest,
): GraphQLHandler => {
  let index = 0;

  return link.operation(({ operationName: name, variables, request }) => {
    if (name !== operationName) {
      return undefined;
    }

    onRequest?.(capture(name, variables, request));

    const step = steps[Math.min(index, steps.length - 1)];
    index += 1;

    return HttpResponse.json(step);
  });
};

/**
 * Answer every operation with an empty `data` object and record each request.
 * Used when a test only cares about what was sent (operation, header).
 */
export const recordAllOperations = (): { handler: GraphQLHandler; requests: CapturedRequest[] } => {
  const requests: CapturedRequest[] = [];

  const handler = link.operation(({ operationName, variables, request }) => {
    requests.push(capture(operationName, variables, request));

    return HttpResponse.json({ data: {} });
  });

  return { handler, requests };
};
