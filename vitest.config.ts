import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find:/^mazey-dayspan-vuetify$/, replacement:resolve(import.meta.dirname, 'src/index.ts') },
      { find:/^mazey-dayspan-vuetify\/style\.css$/, replacement:resolve(import.meta.dirname, 'src/styles/main.scss') },
    ],
  },
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/component/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
    },
  },
})
