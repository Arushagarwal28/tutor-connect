import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // REST API
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Socket.io — must proxy both HTTP handshake and WS upgrade
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,          // <-- enables WebSocket proxying
      },
    },
  },
})