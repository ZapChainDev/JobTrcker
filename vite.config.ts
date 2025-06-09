import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react/jsx-runtime": "react/jsx-runtime.js",
    },
  },
  build: {
    rollupOptions: {
      // external: ['react/jsx-runtime'],
      // output: {
      //   manualChunks: {
      //     'react-vendor': ['react', 'react-dom'],
      //   },
      // },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
})

