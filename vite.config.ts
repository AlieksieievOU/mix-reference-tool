import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin automatically generates a self-signed SSL certificate
    basicSsl()
  ],
  server: {
    // This is the key part that enables HTTPS
    https: true,
    // I'm setting the port to 5175 to match your backend's .env file
    port: 5175,
  },
})
