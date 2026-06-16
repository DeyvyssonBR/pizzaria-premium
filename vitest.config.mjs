// vitest.config.mjs
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.mjs'],
    // TAA-5 owns pizzaria-logic.test.mjs + smoke.test.mjs.
    // TAA-6 owns error-reporter-logic.test.mjs.
    // Both are included; if either fails, the run fails.
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 20_000
  }
});
