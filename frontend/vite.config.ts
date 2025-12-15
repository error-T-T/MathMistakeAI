import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
      // 添加 KaTeX CSS 代理
      '/katex-css': {
        target: 'https://cdn.jsdelivr.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/katex-css/, '/npm/katex@0.16.9/dist/katex.min.css')
      },
      // 代理 Google Fonts 避免可能的 CORS 问题
      '/fonts.googleapis.com': {
        target: 'https://fonts.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fonts.googleapis.com/, '')
      },
      '/fonts.gstatic.com': {
        target: 'https://fonts.gstatic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fonts.gstatic.com/, '')
      }
    },
  },
  // 添加构建优化
  build: {
    rollupOptions: {
      external: ['katex'] // 避免将 KaTeX 打包到 bundle 中
    }
  }
})