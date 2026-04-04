import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ưu tiên .tsx/.ts trước .jsx/.js để tránh xung đột file cùng tên
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
})
