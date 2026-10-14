import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';

// --- MSW lifecycle -------------------------------------------------------
// Error on any request that a test did not explicitly mock, so missing mocks
// fail loudly instead of hitting a real server.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// --- crypto.randomUUID polyfill -----------------------------------------
// jsdom does not always provide crypto.randomUUID, which src/utils/uuid.ts
// relies on. Provide a deterministic-enough v4 generator when it is missing.
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as { crypto?: Crypto }).crypto = {} as Crypto;
}

if (typeof globalThis.crypto.randomUUID !== 'function') {
  let counter = 0;

  (globalThis.crypto as { randomUUID: () => `${string}-${string}-${string}-${string}-${string}` }).randomUUID =
    () => {
      counter += 1;
      const hex = counter.toString(16).padStart(12, '0');
      return `00000000-0000-4000-8000-${hex}` as `${string}-${string}-${string}-${string}-${string}`;
    };
}

// --- Storage cleanup between tests --------------------------------------
// Every test starts with empty localStorage, sessionStorage and cookies so
// state never leaks from one test to the next.
const clearCookies = () => {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const name = cookie.split('=')[0]?.trim();

    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
};

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  clearCookies();
});
