import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      'server-only': fileURLToPath(new URL('./tests/stubs/empty.ts', import.meta.url)),
    },
  },
  // Os testes dos geradores rodam 300 sementes cada; com a suíte toda junta, 5 s não bastam.
  test: { include: ['tests/**/*.test.ts'], testTimeout: 30_000 },
})
