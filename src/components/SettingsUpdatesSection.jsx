import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { APP_VERSION, WHATS_NEW } from '../lib/appVersion'

// "Check for updates" only means something because vite.config.js sets
// registerType: 'prompt' — a newly-deployed service worker installs in the
// background but waits, rather than silently taking over, until
// updateServiceWorker() below actually activates it. needRefresh flips to
// true once one is waiting; registration.update() is what makes the check
// itself happen on demand instead of waiting for the browser's own
// (much less frequent, unpredictable) periodic check.
export default function SettingsUpdatesSection() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const [checking, setChecking] = useState(false)
  const [checkedOnce, setCheckedOnce] = useState(false)

  async function checkForUpdate() {
    setChecking(true)
    setCheckedOnce(false)
    try {
      const registration = await navigator.serviceWorker?.getRegistration()
      await registration?.update()
    } catch {
      // No service worker (e.g. running via `npm run dev`, or a browser
      // that blocked it) — nothing to check; the status below just falls
      // back to "you're up to date" either way, which is true enough.
    }
    // registration.update() resolves once the browser's checked and (if
    // there's a new version) started installing it, but useRegisterSW's
    // own needRefresh flag flips a moment after that, asynchronously — this
    // short fixed wait is so the status below reflects wherever it lands
    // rather than a stale "checking" state.
    setTimeout(() => {
      setChecking(false)
      setCheckedOnce(true)
    }, 1000)
  }

  return (
    <>
      <div className="version-row">
        <span className="version-pill mono">{APP_VERSION}</span>
        <span className="muted">currently installed</span>
      </div>

      <h2 className="settings-section-title">What's new in {APP_VERSION}</h2>
      <ul className="whats-new">
        {WHATS_NEW.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <div className="update-check-box">
        <div className="settings-row" style={{ padding: 0 }}>
          <span>Check you're on the latest version</span>
        </div>
        <button type="button" className="btn-secondary update-check-btn" onClick={checkForUpdate} disabled={checking}>
          {checking ? 'Checking…' : 'Check for updates'}
        </button>

        {checking ? (
          <div className="update-status">
            <span className="inline-spinner" />
            Checking…
          </div>
        ) : needRefresh ? (
          // Shown whenever a waiting update exists, not only right after a
          // manual check — the browser's own background check can flip
          // this independently of the button below.
          <>
            <div className="update-status">
              <span className="update-available">A new version is available</span>
            </div>
            <button type="button" className="btn-primary" onClick={() => updateServiceWorker(true)}>
              Reload to update
            </button>
          </>
        ) : (
          checkedOnce && (
            <div className="update-status">
              <span className="update-ok">✓ You're up to date</span>
            </div>
          )
        )}
      </div>
    </>
  )
}
