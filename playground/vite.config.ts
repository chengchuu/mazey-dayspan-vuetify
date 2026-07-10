import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  root: resolve(import.meta.dirname),
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      'mazey-dayspan-vuetify': resolve(import.meta.dirname, '../src/index.ts'),
    },
  },
})
