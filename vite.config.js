import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to patch axios to prevent fetch adapter issues
const axiosPatchPlugin = () => ({
  name: 'axios-patch-plugin',
  transform(code, id) {
    // Patch axios adapters to prevent Request destructuring error
    if (id.includes('node_modules/axios')) {
      // More aggressive patching - handle all destructuring patterns
      
      // Pattern 1: const { Request, Response } = something;
      code = code.replace(
        /const\s*{\s*Request\s*,\s*Response\s*}\s*=\s*([^;]+);/g,
        (match, source) => {
          return `const Request = (typeof ${source} !== "undefined" && ${source}?.Request) || (typeof window !== "undefined" && window.Request) || class Request {}; const Response = (typeof ${source} !== "undefined" && ${source}?.Response) || (typeof window !== "undefined" && window.Response) || class Response {};`;
        }
      );
      
      // Pattern 2: const { Request } = something;
      code = code.replace(
        /const\s*{\s*Request\s*}\s*=\s*([^;]+);/g,
        (match, source) => {
          return `const Request = (typeof ${source} !== "undefined" && ${source}?.Request) || (typeof window !== "undefined" && window.Request) || class Request {};`;
        }
      );
      
      // Pattern 3: const { Response } = something;
      code = code.replace(
        /const\s*{\s*Response\s*}\s*=\s*([^;]+);/g,
        (match, source) => {
          return `const Response = (typeof ${source} !== "undefined" && ${source}?.Response) || (typeof window !== "undefined" && window.Response) || class Response {};`;
        }
      );

      // Pattern 4: Direct access like someModule.Request
      // Add safety checks for undefined modules
      code = code.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\.Request/g,
        '($1 && $1.Request) || (typeof window !== "undefined" && window.Request)'
      );
      
      code = code.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\.Response/g,
        '($1 && $1.Response) || (typeof window !== "undefined" && window.Response)'
      );
    }
    return code;
  }
});

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
        
        // Process polyfill
        if (typeof process === 'undefined') {
          window.process = { 
            env: { NODE_ENV: 'production' },
            browser: true,
            version: '',
            versions: {},
            nextTick: function(fn) { setTimeout(fn, 0); }
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
  plugins: [polyfillPlugin(), axiosPatchPlugin(), react()],
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
    'process.env.NODE_ENV': '"production"',
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
    include: ['buffer', 'process', 'axios'],
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
        intro: `
// CRITICAL: Polyfills must run IMMEDIATELY before ANY module code
// This runs at the TOP of EVERY chunk file
(function() {
  'use strict';
  
  // Ensure window exists (for SSR safety)
  if (typeof window === 'undefined') return;
  
  // Initialize globalThis
  if (typeof globalThis === 'undefined') {
    window.globalThis = window;
  }

  // Set up global object - CRITICAL for simple-peer and axios
  if (!window.global) window.global = window;
  if (!globalThis.global) globalThis.global = globalThis;

  // Process polyfill - MUST be defined before axios loads
  if (typeof window.process === 'undefined') {
    window.process = { 
      env: { NODE_ENV: 'production' },
      browser: true,
      version: '',
      versions: {},
      nextTick: function(fn) { setTimeout(fn, 0); }
    };
  }
  if (!global.process) global.process = window.process;
  if (!globalThis.process) globalThis.process = window.process;

  // Buffer polyfill
  if (typeof window.Buffer === 'undefined') {
    window.Buffer = { 
      isBuffer: function() { return false; }
    };
  }
  if (!global.Buffer) global.Buffer = window.Buffer;
  if (!globalThis.Buffer) globalThis.Buffer = window.Buffer;

  // CRITICAL FIX for axios: Ensure Request/Response are ALWAYS available
  // This prevents "Cannot destructure property 'Request' of 'undefined'"
  
  // Native Request API or fallback
  if (!window.Request) {
    window.Request = class Request {
      constructor(input, init) {
        this.url = input;
        this.method = (init && init.method) || 'GET';
        this.headers = (init && init.headers) || {};
        this.body = (init && init.body) || null;
      }
    };
  }
  
  // Native Response API or fallback
  if (!window.Response) {
    window.Response = class Response {
      constructor(body, init) {
        this.body = body;
        this.status = (init && init.status) || 200;
        this.statusText = (init && init.statusText) || 'OK';
        this.headers = (init && init.headers) || {};
        this.ok = this.status >= 200 && this.status < 300;
      }
      json() { return Promise.resolve(JSON.parse(this.body)); }
      text() { return Promise.resolve(String(this.body)); }
    };
  }
  
  // Native fetch or fallback
  if (!window.fetch) {
    window.fetch = function() {
      return Promise.reject(new Error('Fetch API not available'));
    };
  }

  // Make them available on ALL global objects for axios
  global.Request = window.Request;
  global.Response = window.Response;
  global.fetch = window.fetch;
  globalThis.Request = window.Request;
  globalThis.Response = window.Response;
  globalThis.fetch = window.fetch;
  
  // Also expose on self for web workers compatibility
  if (typeof self !== 'undefined') {
    self.Request = window.Request;
    self.Response = window.Response;
    self.fetch = window.fetch;
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
