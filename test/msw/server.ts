import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Shared MSW server for the test suite. Individual tests register per-request
 * GraphQL responses through `server.use(...)`; `server.resetHandlers()` runs
 * after each test so overrides never leak between tests.
 */
export const server = setupServer(...handlers);
