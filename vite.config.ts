import { defineConfig } from 'vite';
import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import postcssNesting from 'postcss-nesting';
import autoprefixer from 'autoprefixer';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Pages from 'vite-plugin-pages';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': `${path.resolve(__dirname, 'src')}/`,
    },
  },

  plugins: [
    vue(),
    Pages(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables', 'src/stores', 'src/types'],
      vueTemplate: true,
    }),
    Components({
      dts: 'src/components.d.ts',
    }),
  ],

  css: {
    postcss: {
      plugins: [postcssNesting, autoprefixer({})],
    },
  },
});
