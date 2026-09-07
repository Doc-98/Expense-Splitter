import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_VERSION } from '../lib/appVersion'

// The account chip used to open a dropdown (this guide, Your stats,
// Settings, About, Sign out) — now it's a plain link straight into
// Settings, which holds all of that (plus Groups, Budgets, Scan, Updates)
// as sections of its own, reached via its side nav rather than this menu.
// See Settings.jsx.
export default function AppHeader() {
  const { displayName } = useAuth()

  return (
    <div className="app-header">
      <Link to="/" className="app-header-brand">
        Expense Splitter
        <span className="muted app-header-version">{APP_VERSION}</span>
      </Link>
      <Link to="/settings" className="account-chip">
        {displayName || '…'}
      </Link>
    </div>
  )
}
