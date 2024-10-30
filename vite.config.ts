import { defineConfig } from 'vite';
import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import postcssNesting from 'postcss-nesting';
import autoprefixer from 'autoprefixer';
import AutoImport from 'unplugin-auto-import/vite';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import Components from 'unplugin-vue-components/vite';
import VueRouter from 'unplugin-vue-router/vite';
import svgLoader from 'vite-svg-loader';
import vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': `${path.resolve(__dirname, 'src')}/`,
    },
  },

  plugins: [
    VueRouter(),
    vue(),
    AutoImport({
      imports: ['vue', VueRouterAutoImports],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables', 'src/stores', 'src/types'],
      vueTemplate: true,
    }),
    Components({
      dts: 'src/components.d.ts',
    }),
    svgLoader({
      svgoConfig: {
        multipass: true,
      },
      defaultImport: 'component',
    }),
    vuetify(),
  ],

  css: {
    postcss: {
      plugins: [postcssNesting, autoprefixer({})],
    },
  },
});
