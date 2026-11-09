import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Only logic-bearing files count towards coverage.
      include: ['src/client.ts', 'src/utils/**'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
