import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // served from https://kenzoengineer.github.io/minesweeper/
  base: "/minesweeper/",
  plugins: [react()],
})
