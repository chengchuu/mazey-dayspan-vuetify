import { defineConfig } from 'vite'; import vue from '@vitejs/plugin-vue'; import { resolve } from 'node:path'
export default defineConfig({root:resolve(import.meta.dirname),plugins:[vue()],resolve:{alias:{'mazey-dayspan-vuetify':resolve(import.meta.dirname,'../src/index.ts')}}})
