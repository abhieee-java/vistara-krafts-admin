import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  envPrefix: ['VITE_', 'SUPABASE_', 'CLOUDINARY_'],
  server: {
    port: 3001,
    host: true
  }
});
