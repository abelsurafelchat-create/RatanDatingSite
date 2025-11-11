import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to inject polyfills at the very start of the bundle
const polyfillPlugin = () => ({
  name: 'polyfill-plugin',
  transformIndexHtml(html) {
    return html.replace(
      '<head>',
      `<head>
    <script>
      // CRITICAL: Polyfill global and its properties BEFORE any module loads
      (function() {
        // Initialize globalThis
        if (typeof globalThis === 'undefined') {
          window.globalThis = window;
        }
        
        // Set up global object - THIS IS CRITICAL
        window.global = window.global || window;
        globalThis.global = globalThis.global || globalThis;
        
        // Polyfill Request and Response for simple-peer
        if (typeof Request === 'undefined') {
          window.Request = class Request {
            constructor(input, init) {
              this.url = input;
              this.method = (init && init.method) || 'GET';
              this.headers = (init && init.headers) || {};
            }
          };
        }
        
        if (typeof Response === 'undefined') {
          window.Response = class Response {
            constructor(body, init) {
              this.body = body;
              this.status = (init && init.status) || 200;
              this.headers = (init && init.headers) || {};
            }
          };
        }
        
        // Ensure they're on global object
        global.Request = global.Request || window.Request;
        global.Response = global.Response || window.Response;
        globalThis.Request = globalThis.Request || window.Request;
        globalThis.Response = globalThis.Response || window.Response;
        
        // Process polyfill
        if (typeof process === 'undefined') {
          window.process = { 
            env: { NODE_ENV: 'production' },
            browser: true,
            version: '',
            versions: {}
          };
          global.process = window.process;
        }
        
        // Buffer polyfill
        if (typeof Buffer === 'undefined') {
          window.Buffer = { 
            isBuffer: function() { return false; }
          };
          global.Buffer = window.Buffer;
        }
      })();
    </script>`
    );
  }
});

export default defineConfig({
  plugins: [polyfillPlugin(), react()],
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
    'global.Request': 'globalThis.Request',
    'global.Response': 'globalThis.Response',
    'process.env': {},
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
            // Axios
            if (id.includes('axios')) {
              return 'axios-vendor';
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
        banner: `
(function() {
  // Critical polyfills - must run before ANY module code
  if (typeof globalThis === 'undefined') {
    window.globalThis = window;
  }
  
  // Set up global object - CRITICAL for simple-peer
  window.global = window.global || window;
  globalThis.global = globalThis.global || globalThis;
  
  // Polyfill Request and Response
  if (typeof Request === 'undefined') {
    window.Request = class Request {
      constructor(input, init) {
        this.url = input;
        this.method = (init && init.method) || 'GET';
        this.headers = (init && init.headers) || {};
      }
    };
  }
  
  if (typeof Response === 'undefined') {
    window.Response = class Response {
      constructor(body, init) {
        this.body = body;
        this.status = (init && init.status) || 200;
        this.headers = (init && init.headers) || {};
      }
    };
  }
  
  // Ensure they're on global object
  global.Request = global.Request || window.Request;
  global.Response = global.Response || window.Response;
  globalThis.Request = globalThis.Request || window.Request;
  globalThis.Response = globalThis.Response || window.Response;
  
  // Process polyfill
  if (typeof process === 'undefined') {
    window.process = { 
      env: { NODE_ENV: 'production' },
      browser: true,
      version: '',
      versions: {}
    };
    global.process = window.process;
  }
  
  // Buffer polyfill
  if (typeof Buffer === 'undefined') {
    window.Buffer = { 
      isBuffer: function() { return false; }
    };
    global.Buffer = window.Buffer;
  }
})();
        `,
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
