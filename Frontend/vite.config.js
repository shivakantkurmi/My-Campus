import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// No proxy — frontend calls the backend directly via VITE_API_BASE_URL in .env
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
