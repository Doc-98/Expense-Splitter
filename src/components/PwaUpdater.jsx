import { useRegisterSW } from 'virtual:pwa-register/react'

// Registers the service worker unconditionally on app load — mounted once
// at the top of the tree (see App.jsx), independent of whether anyone ever
// opens Settings > Updates. That page's own SettingsUpdatesSection.jsx
// calls useRegisterSW() again for its own local "needRefresh" UI state;
// registering twice is harmless (navigator.serviceWorker.register() is
// idempotent — a second call just resolves to the same registration), and
// keeps that component self-contained rather than needing this one to
// hand it anything. Renders nothing; the registration itself is the only
// point of this component existing.
export default function PwaUpdater() {
  useRegisterSW()
  return null
}
