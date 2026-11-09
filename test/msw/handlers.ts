import type { RequestHandler } from 'msw';

/**
 * Default handlers registered on the shared server. Intentionally empty: each
 * test registers exactly the operations it needs through `server.use(...)`, so
 * any unmocked request surfaces as an error instead of silently passing.
 */
export const handlers: RequestHandler[] = [];
