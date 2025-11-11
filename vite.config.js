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
      strictRequires: true,
    },
    rollupOptions: {
      // Prevent circular dependencies
      treeshake: {
        moduleSideEffects: 'no-external',
      },
      output: {
        // Fix circular dependency issues
        manualChunks: (id) => {
          // Separate vendor chunks to prevent circular dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-vendor';
            }
            // Split WebRTC libraries separately to avoid circular deps
            if (id.includes('simple-peer')) {
              return 'simple-peer-vendor';
            }
            if (id.includes('socket.io')) {
              return 'socket-vendor';
            }
            // Keep other common dependencies separate
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            return 'vendor';
          }
        },
        // Ensure proper module initialization order
        inlineDynamicImports: false,
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
