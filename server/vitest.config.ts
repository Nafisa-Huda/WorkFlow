import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      SESSION_SECRET: 'test-secret-that-is-at-least-32-characters-long',
      MONGODB_URI: 'mongodb://unused-in-tests',
    },
    globalSetup: ['tests/globalSetup.ts'],
    // The first run downloads a MongoDB binary.
    hookTimeout: 120_000,
  },
})
