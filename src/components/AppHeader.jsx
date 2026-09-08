import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_VERSION } from '../lib/appVersion'
import { prefetchSettingsGroups, prefetchBudgets } from '../lib/prefetchSettings'

// The account chip used to open a dropdown (this guide, Your stats,
// Settings, About, Sign out) — now it's a plain link straight into
// Settings, which holds all of that (plus Groups, Budgets, Scan, Updates)
// as sections of its own, reached via its side nav rather than this menu.
// See Settings.jsx.
export default function AppHeader() {
  const { user, displayName } = useAuth()

  return (
    <div className="app-header">
      <Link to="/" className="app-header-brand">
        Expense Splitter
        <span className="muted app-header-version">{APP_VERSION}</span>
      </Link>
      {/* Settings' own Groups and Budgets sections are the two that hit the
          database (see each one's own comment) — fired here, the instant
          this is clicked, rather than waiting for those sections to mount,
          so by the time either one's on screen the fetch may already be
          done. Not awaited, and never blocks the navigation itself — see
          prefetchSettings.js for why a failure here is silently swallowed. */}
      <Link
        to="/settings"
        className="account-chip"
        onClick={() => {
          prefetchSettingsGroups(user.id)
          prefetchBudgets(user.id)
        }}
      >
        {displayName || '…'}
      </Link>
    </div>
  )
}
