import { useEffect, useState } from 'react'

const SEEN_KEY = 'spesa-install-prompt-seen'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// A one-time "add to your home screen" shelf, for anyone opening Spesa in
// a browser tab rather than as an already-installed app. Chromium-based
// browsers (Chrome/Edge on Android and desktop) fire `beforeinstallprompt`
// once their own install-eligibility heuristics are satisfied — this just
// captures that event instead of letting the browser show its own default
// mini-infobar, so the ask matches the rest of the app's own design
// instead.
//
// Safari (iOS and macOS) never fires this event at all — there's no
// programmatic install prompt there, only the manual Share sheet → "Add to
// Home Screen" path — so this banner simply never appears for anyone on
// Safari. Not worth a separate hand-rolled set of instructions for now;
// revisit if enough of this app's users turn out to be on iOS specifically.
export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    try {
      if (localStorage.getItem(SEEN_KEY)) return
    } catch {
      // Storage blocked — falls back to "always eligible to show," same as
      // every other localStorage-backed preference in this app when it's
      // unavailable; worst case this banner offers itself more than once.
    }

    function onBeforeInstallPrompt(e) {
      e.preventDefault()
      setDeferredEvent(e)
    }
    function onInstalled() {
      markSeen()
      setDeferredEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function markSeen() {
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Nothing to fall back to here — worst case it can show again next
      // visit, same as the read side above.
    }
  }

  async function install() {
    if (!deferredEvent) return
    deferredEvent.prompt()
    await deferredEvent.userChoice
    // The native prompt already gave them a real choice either way —
    // accepted or dismissed, this banner's done its job and shouldn't ask
    // again.
    markSeen()
    setDeferredEvent(null)
  }

  function dismiss() {
    markSeen()
    setDismissed(true)
  }

  if (!deferredEvent || dismissed) return null

  return (
    <div className="install-banner">
      <span className="install-banner-mark" aria-hidden="true">
        S
      </span>
      <span className="install-banner-text">
        <strong>Add Spesa to your home screen</strong>
        <span className="muted">Opens like a real app, straight from your phone.</span>
      </span>
      <button type="button" className="btn-primary" onClick={install}>
        Install
      </button>
      <button type="button" className="install-banner-dismiss" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
