import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: true,
      // Mengaktifkan HMR dengan spesifikasi port WebSocket yang jelas
      hmr: process.env.DISABLE_HMR === 'true' ? false : {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
      },
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});