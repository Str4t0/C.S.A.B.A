import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// HTTPS beállítások
// Automatikusan észleli a tanúsítványt, ha létezik
// Vagy használd a USE_HTTPS=true környezeti változót
const certPath = path.resolve(__dirname, 'certs/cert.pem')
const keyPath = path.resolve(__dirname, 'certs/key.pem')
const hasCertFiles = fs.existsSync(certPath) && fs.existsSync(keyPath)
const useHttps = process.env.USE_HTTPS === 'true' || hasCertFiles

const httpsConfig = (() => {
  if (!useHttps) {
    return false // HTTP használata hálózati eléréshez
  }
  
  // Ha léteznek a tanúsítvány fájlok, használjuk őket
  if (hasCertFiles) {
    console.log('🔐 HTTPS tanúsítványok betöltve')
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    }
  }
  
  // Ha nincs tanúsítvány, Vite automatikusan generál egyet
  // Ez self-signed tanúsítványt hoz létre
  console.log('🔐 Vite automatikusan generál HTTPS tanúsítványt...')
  return true  // true = Vite automatikusan generál tanúsítványt
})()

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Explicit 0.0.0.0 binding for network access
    https: httpsConfig,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/documents': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
