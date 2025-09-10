import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Chat-ai/',
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5173,      // 指定端口
    strictPort: true, // 如果端口被占用则失败
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  publicDir: 'public',
})
