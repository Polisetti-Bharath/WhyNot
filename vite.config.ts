import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React vendor bundle
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // UI/Animation libraries
            'ui-vendor': ['framer-motion', 'lucide-react'],
            // Three.js for 3D graphics (largest dependency)
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
            // Supabase client
            'supabase-vendor': ['@supabase/supabase-js'],
          },
        },
      },
      // Increase chunk size warning limit to 800kb
      chunkSizeWarningLimit: 800,
    },
  };
});
