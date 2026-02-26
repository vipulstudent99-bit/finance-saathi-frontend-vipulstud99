import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const isDevServer = process.env.NODE_ENV !== 'production';
const babelMetadataPlugin = isDevServer
  ? require('./plugins/visual-edits/babel-metadata-plugin')
  : null;
const setupDevServer = isDevServer
  ? require('./plugins/visual-edits/dev-server-setup')
  : null;

export default defineConfig({
  plugins: [
    react({
      babel: babelMetadataPlugin
        ? { plugins: [babelMetadataPlugin] }
        : undefined,
    }),
    {
      name: 'visual-edits-server',
      configureServer(server) {
        if (!setupDevServer) return;
        try {
          const express = require('express');
          const app = express();
          setupDevServer({ app });
          server.middlewares.use(app);
        } catch (e) {
          console.warn('[visual-edits] Failed to setup dev server:', e);
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Prefer TypeScript files over JavaScript when both exist
    extensions: ['.mts', '.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  optimizeDeps: {
    esbuildOptions: {
      // Handle .js files with JSX
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
