import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Express server endpoints (postgres-server.js)
      '/api/auth': {
        target: 'http://localhost:3081',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Auth API Proxy error:', err);
          });
        }
      },
      '/api/user': {
        target: 'http://localhost:3081',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('User API Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending User API request to:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received User API response from:', req.url, 'Status:', proxyRes.statusCode);
          });
        }
      },
      '/api/databases': {
        target: 'http://localhost:3081',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Databases API Proxy error:', err);
          });
        }
      },
      '/api/execute-sql': {
        target: 'http://localhost:3081',
        changeOrigin: true,
      },
      '/api/direct-sql': {
        target: 'http://localhost:3081',
        changeOrigin: true,
      },
      '/api/sync-databases': {
        target: 'http://localhost:3081',
        changeOrigin: true,
      },
      
      // Neon backend service endpoints
      '/api/pageserver': {
        target: 'http://localhost:9898',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pageserver/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Pageserver Proxy error:', err);
          });
        }
      },
      '/api/compute': {
        target: 'http://localhost:3080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/compute/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Compute Proxy error:', err);
          });
        }
      },
      '/api/safekeeper': {
        target: 'http://localhost:7676',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/safekeeper/, ''),
      },
      '/api/broker': {
        target: 'http://localhost:50051',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/broker/, ''),
      },
      
      // Catch-all for any other API endpoints
      '/api': {
        target: 'http://localhost:3081',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('API Catch-all Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Catch-all: Sending request to:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Catch-all: Received response from:', req.url, 'Status:', proxyRes.statusCode);
          });
        }
      }
    }
  }
}); 