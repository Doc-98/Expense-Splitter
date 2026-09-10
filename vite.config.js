import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'
import { findLatestVersion } from './src/lib/versionFromCommit.js'

// The app's version number is derived from git, not hand-maintained: every
// PR merged into this repo is squash-merged, and GitHub always appends
// " (#123)" to a squash-merge's own commit subject, so the most recent
// commit already names its own PR number. Walking recent subjects (newest
// first) until one has a PR number means the version can never drift from
// what's actually shipped — see src/lib/versionFromCommit.js for the actual
// extraction logic (kept there, pure and unit-tested, independent of git).
// Falls back to 'dev' for a shallow checkout or a repo with no matching
// history (e.g. a fresh clone with no git dir at all).
function readAppVersion() {
  try {
    const log = execSync('git log --pretty=%s -50', { encoding: 'utf-8' })
    const subjects = log.split('\n').filter(Boolean)
    return findLatestVersion(subjects) || 'dev'
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(readAppVersion()),
  },
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
