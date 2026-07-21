import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Only logic-bearing files count towards coverage.
      include: ['src/client.ts', 'src/utils/**'],
      // Declarative, non-logic files are excluded from the measurement.
      exclude: [
        'src/mutations/**',
        'src/queries/**',
        'src/fragments/**',
        'src/types.ts',
        'src/constants.ts',
        'src/index.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      // Ratchet threshold: set to the level reached today (floored to whole
      // numbers) and raised per phase towards 100% coverage of client.ts +
      // utils/. The build fails if coverage drops below these numbers, so
      // regressions are blocked without hindering the step-by-step build-up.
      // When a phase adds tests, bump these up to the new achieved level.
      thresholds: {
        statements: 66,
        branches: 48,
        functions: 55,
        lines: 66,
      },
    },
  },
});
