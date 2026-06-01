import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['tendr-icon.png'],
      manifest: {
        name: 'Tendr — Celebration Platform',
        short_name: 'Tendr',
        description: 'Book vendors, plan your event, send invitations — all in one place. Delhi NCR\'s celebration platform.',
        theme_color: '#C47A2E',
        background_color: '#FFF8F2',
        display: 'standalone',
        orientation: 'portrait',
        display_override: ['standalone', 'minimal-ui'],
        "interactive_widget": "overlays-content",
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/tendr-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/tendr-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        categories: ['lifestyle', 'utilities', 'business'],
        lang: 'en-IN',
        dir: 'ltr',
      },
      workbox: {
        // Changing cacheId forces Workbox to delete ALL old caches and
        // fetch fresh resources — increment this whenever a major update is needed
        cacheId: 'tendr-v3',
        skipWaiting: true,
        clientsClaim: true,
        // Increase limit to 10 MB to accommodate large assets
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // Cache app shell — exclude huge background/hero images
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        globIgnores: [
          '**/signup-bg*',
          '**/login-bg*',
          '**/hero-*',
        ],
        // Don't cache API calls — always fetch fresh from Render
        navigateFallback: null,
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Cache Cloudinary images (vendor photos, gallery)
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
})
