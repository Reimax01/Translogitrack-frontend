import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()], // Habilita el nuevo JSX transform
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});