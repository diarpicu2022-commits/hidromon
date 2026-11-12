import { defineConfig } from 'vite';

// En desarrollo el navegador llama a /api y Vite lo reenvía a la API de Nest,
// así no hace falta habilitar CORS en el backend.
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
