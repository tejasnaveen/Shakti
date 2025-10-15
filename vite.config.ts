import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          router: ['react-router-dom'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    // Configure for subdomain support in development
    configureServer: (server) => {
      server.middlewares.use((req, res, next) => {
        // Handle subdomain routing for development
        const host = req.headers.host || '';
        if (host.includes('.localhost')) {
          // For subdomains like company1.localhost:3000
          const subdomain = host.split('.')[0];
          if (subdomain && subdomain !== 'www') {
            // Add custom header for tenant detection
            req.headers['x-tenant-subdomain'] = subdomain;
          }
        }
        next();
      });
    }
  },
  preview: {
    port: 4173,
    host: true
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
