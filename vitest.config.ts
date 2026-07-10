import { defineConfig } from 'vitest/config'; import vue from '@vitejs/plugin-vue'
export default defineConfig({plugins:[vue()],test:{include:['tests/unit/**/*.test.ts','tests/component/**/*.test.ts'],environment:'jsdom',setupFiles:['./tests/setup.ts'],coverage:{provider:'v8',reporter:['text','html'],include:['src/**/*.{ts,vue}']}}})
