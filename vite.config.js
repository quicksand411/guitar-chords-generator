import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite MUST have this file to know how to process React/JSX
export default defineConfig({
  plugins: [react()],
})
