import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { reviewApiPlugin } from './server/api.js';

export default defineConfig({
  plugins: [react(), tailwindcss(), reviewApiPlugin()],
  build: {
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        review: resolve(import.meta.dirname, 'review/index.html'),
        results: resolve(import.meta.dirname, 'review/results/index.html'),
      },
    },
  },
});
