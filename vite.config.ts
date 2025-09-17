import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: true,        // <- activa https con cert confiable (mkcert)
    host: 'localhost',
    port: 5173,
    strictPort: true
    // opcional: proxy para evitar CORS (si quisieras)
    // proxy: { '/api': { target: 'https://localhost:7025', changeOrigin: true, secure: false } }
  }
});
