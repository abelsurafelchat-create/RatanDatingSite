import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
  define: {
    'global': 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
      util: 'util',
      stream: 'stream-browserify',
      events: 'events',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['buffer', 'process'],
    exclude: [],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Fix circular dependency issues with proper chunk splitting
        manualChunks: (id) => {
          // Separate vendor chunks to prevent circular dependencies
          if (id.includes('node_modules')) {
            // React core - must load first
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // React Router - depends on React
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Framer Motion - animation library
            if (id.includes('framer-motion')) {
              return 'framer-vendor';
            }
            // Socket.io client
            if (id.includes('socket.io-client') || id.includes('engine.io-client')) {
              return 'socket-vendor';
            }
            // Simple Peer and WebRTC dependencies
            if (id.includes('simple-peer') || id.includes('get-browser-rtc') || id.includes('randombytes')) {
              return 'webrtc-vendor';
            }
            // All other dependencies
            return 'vendor';
          }
        },
        // Ensure proper module initialization order
        inlineDynamicImports: false,
        // Preserve module structure
        preserveModules: false,
        // Use more compatible format
        format: 'es',
        // Better variable naming to avoid conflicts
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging
    sourcemap: false,
    // Use esbuild for minification (faster and built-in)
    minify: 'esbuild',
  },
});
