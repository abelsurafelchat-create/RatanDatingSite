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
      // Polyfill global and its properties BEFORE any module loads
      (function() {
        if (typeof globalThis === 'undefined') {
          window.globalThis = window;
        }
        globalThis.global = globalThis;
        window.global = globalThis;
        
        // Ensure Request and Response exist on global
        if (!globalThis.Request) {
          globalThis.Request = window.Request || class Request {
            constructor(input, init) {
              this.url = input;
              this.method = init?.method || 'GET';
            }
          };
        }
        if (!globalThis.Response) {
          globalThis.Response = window.Response || class Response {
            constructor(body, init) {
              this.body = body;
              this.status = init?.status || 200;
            }
          };
        }
        if (!globalThis.process) {
          globalThis.process = { env: {}, browser: true, version: '', versions: {} };
        }
        if (!globalThis.Buffer) {
          globalThis.Buffer = { isBuffer: () => false };
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
        banner: `
(function() {
  // Critical polyfills - must run before ANY module code
  if (typeof globalThis === 'undefined') {
    window.globalThis = window;
  }
  if (typeof globalThis.Request === 'undefined') {
    globalThis.Request = class Request {
      constructor(input, init) {
        this.url = input;
        this.method = init?.method || 'GET';
      }
    };
  }
  if (typeof globalThis.Response === 'undefined') {
    globalThis.Response = class Response {
      constructor(body, init) {
        this.body = body;
        this.status = init?.status || 200;
      }
    };
  }
  if (typeof globalThis.process === 'undefined') {
    globalThis.process = { env: {}, browser: true, version: '', versions: {} };
  }
  if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = { isBuffer: () => false };
  }
})();
        `,
      },
    },
  },
});
