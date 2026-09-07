import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Was 'autoUpdate' — a new deployed version used to take over silently
      // in the background with no way to see or trigger it. 'prompt' instead
      // leaves a new service worker waiting until something explicitly
      // activates it, which is what makes the Settings > Updates section's
      // "Check for updates" / "Reload to update" actually mean something
      // (see src/components/SettingsUpdatesSection.jsx's useRegisterSW call)
      // rather than almost always just reporting "up to date" because the
      // update had already silently applied before anyone looked.
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Spesa - Expense Splitter',
        short_name: 'Spesa',
        description: 'Split receipts and expenses with your group, in real time.',
        theme_color: '#2F6F5E',
        background_color: '#FAF9F6',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
})
