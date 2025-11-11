// CRITICAL POLYFILLS - Must be imported FIRST before any other modules
// This prevents "Cannot destructure property 'Request' of 'undefined'" error in axios

(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  // Initialize globalThis
  if (typeof globalThis === 'undefined') {
    window.globalThis = window;
  }
  
  // Set up global object
  if (!window.global) window.global = window;
  if (!globalThis.global) globalThis.global = globalThis;
  
  // Process polyfill
  if (typeof window.process === 'undefined') {
    window.process = {
      env: { NODE_ENV: 'production' },
      browser: true,
      version: '',
      versions: {},
      nextTick: function(fn) { setTimeout(fn, 0); }
    };
  }
  if (typeof global !== 'undefined') global.process = window.process;
  if (typeof globalThis !== 'undefined') globalThis.process = window.process;
  
  // Buffer polyfill
  if (typeof window.Buffer === 'undefined') {
    window.Buffer = {
      isBuffer: function() { return false; }
    };
  }
  if (typeof global !== 'undefined') global.Buffer = window.Buffer;
  if (typeof globalThis !== 'undefined') globalThis.Buffer = window.Buffer;
  
  // CRITICAL: Request/Response/fetch polyfills for axios
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
      arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
      blob() { return Promise.resolve(new Blob()); }
    };
  }
  
  if (!window.fetch) {
    window.fetch = function() {
      return Promise.reject(new Error('Fetch API not available - using XHR'));
    };
  }
  
  // Expose on ALL global objects
  if (typeof global !== 'undefined') {
    global.Request = window.Request;
    global.Response = window.Response;
    global.fetch = window.fetch;
  }
  
  if (typeof globalThis !== 'undefined') {
    globalThis.Request = window.Request;
    globalThis.Response = window.Response;
    globalThis.fetch = window.fetch;
  }
  
  if (typeof self !== 'undefined') {
    self.Request = window.Request;
    self.Response = window.Response;
    self.fetch = window.fetch;
  }
  
  console.log('✓ Polyfills loaded successfully');
})();
