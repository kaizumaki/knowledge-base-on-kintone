import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

const inputPath = process.env.INPUT_PATH || './src/workflow-master.ts';

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
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, inputPath),
      output: {
        format: 'iife', // 即時実行関数
        dir: 'dist',
        assetFileNames: '[name][extname]',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
      },
    }
  },
});
