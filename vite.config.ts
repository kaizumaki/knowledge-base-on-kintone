import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/github-markdown-css/github-markdown-light.css',
          dest: './',
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: 'src/kintone.ts',
      output: {
        format: 'iife', // 即時実行関数
        dir: 'dist',
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
      },
    }
  },
});
