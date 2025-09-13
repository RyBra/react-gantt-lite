import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages deployment under /<repo> base path, set base accordingly.
  // Replace '/react-gantt-lite' with your repository name if different.
  base: '/react-gantt-lite/',
  server: {
    port: 5174,
    open: true
  },
  build: {
    sourcemap: true
  }
});

