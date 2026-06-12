import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Inside Docker the backend is reachable via its service name, not localhost
const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // Polling ensures file changes are detected inside Docker bind mounts
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/api': proxyTarget,
      '/health': proxyTarget,
      '/socket.io': {
        target: proxyTarget,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
