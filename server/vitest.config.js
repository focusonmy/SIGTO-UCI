import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.{test,spec}.{js,jsx}'],
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ['./src/__tests__/setup.js'],
  },
})