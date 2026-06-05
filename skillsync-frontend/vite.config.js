import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Skip proxying when the request is a browser navigation (Accept: text/html).
// That lets React Router render frontend routes that share a path prefix with
// the API (e.g. /auth/login) instead of forwarding the GET to the gateway.
// Returning '/' tells Vite to serve the SPA shell from the project root.
const apiBypass = (req) => {
  const accept = req.headers.accept || '';
  if (req.method === 'GET' && accept.includes('text/html')) {
    return '/';
  }
};

const apiProxy = {
  target: 'http://localhost:8888',
  changeOrigin: true,
  bypass: apiBypass
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy API requests to the Spring Cloud Gateway in dev so the SPA can
      // call the backend without CORS friction. The bypass function makes sure
      // browser navigations to paths like /auth/login still hit React Router.
      '/auth':          { ...apiProxy },
      '/users':         { ...apiProxy },
      '/mentors':       { ...apiProxy },
      '/skills':        { ...apiProxy },
      '/sessions':      { ...apiProxy },
      '/notifications': { ...apiProxy },
      '/support':       { ...apiProxy },
      '/chatbot':       { ...apiProxy }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1024
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/test/**',
        'src/main.jsx',
        'src/index.jsx'
      ]
    }
  }
});
