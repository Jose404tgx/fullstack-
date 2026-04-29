import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/clientes': 'http://localhost:3127',
      '/categoria': 'http://localhost:3127',
      '/proveedor': 'http://localhost:3127',
      '/producto': 'http://localhost:3127',
      '/ventas': 'http://localhost:3127',
      '/detalle_venta': 'http://localhost:3127'
    }
  }
})
