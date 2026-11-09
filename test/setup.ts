import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';

// --- MSW lifecycle -------------------------------------------------------
// Error on any request that a test did not explicitly mock, so missing mocks
// fail loudly instead of hitting a real server.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// --- Storage cleanup between tests --------------------------------------
// Every test starts with empty localStorage, sessionStorage and cookies so
// state never leaks from one test to the next.
const clearCookies = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const name = cookie.split('=')[0]?.trim();

    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
};

// Guarded so the setup also runs in `@vitest-environment node` (SSR) files.
afterEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }

  clearCookies();
});
