import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Đảm bảo đường dẫn tương đối chạy mượt mà trên GitHub Pages /FoodMate/
  server: {
    port: 5173,
    host: true,
  },
});
