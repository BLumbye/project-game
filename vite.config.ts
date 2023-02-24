import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import postcssNesting from 'postcss-nesting';
import autoprefixer from 'autoprefixer';
import postcssNormalize from 'postcss-normalize';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [postcssNesting, autoprefixer({}), postcssNormalize()],
    },
  },
});
