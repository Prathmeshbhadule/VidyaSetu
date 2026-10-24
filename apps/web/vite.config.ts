/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/content'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'vidya-content-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days offline guarantee
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/schemes'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vidya-schemes-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Vidya Setu',
        short_name: 'VidyaSetu',
        description: 'Offline-First Learning Platform for Rural Schools',
        theme_color: '#ea580c', // Warm amber/orange child-friendly
        background_color: '#fef3c7',
        display: 'standalone',
        orientation: 'landscape-primary',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query', 'zustand', 'dexie'],
          ui: ['lucide-react', 'recharts'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
