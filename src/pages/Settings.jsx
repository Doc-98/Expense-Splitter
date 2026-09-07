import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useCurrency, CURRENCIES } from '../context/CurrencyContext'
import { getStatsPreferences, setStatsPreferences } from '../lib/statsPreferences'
import { signOutAndClearCaches } from '../lib/signOut'
import { GRANULARITIES, granularityLabel } from '../components/TimeRangeSelector'
import BudgetsSection from '../components/BudgetsSection'
import ScanSettingsSection from '../components/ScanSettingsSection'
import GuideSection from '../components/GuideSection'
import AboutSection from '../components/AboutSection'
import SettingsGroupsSection from '../components/SettingsGroupsSection'
import SettingsUpdatesSection from '../components/SettingsUpdatesSection'
import SettingsNav from '../components/SettingsNav'
import ConfirmSheet from '../components/ConfirmSheet'
import BackButton from '../components/BackButton'
import { MenuIcon, ProfileIcon, GroupsNavIcon, BudgetIcon, ScanIcon, GuideIcon, UpdatesIcon, AboutIcon } from '../components/icons'

const SECTIONS = [
  { id: 'profile', label: 'Profile', Icon: ProfileIcon },
  { id: 'groups', label: 'Groups', Icon: GroupsNavIcon },
  { id: 'budgets', label: 'Budgets', Icon: BudgetIcon },
  { id: 'scan', label: 'Scan', Icon: ScanIcon },
  { id: 'guide', label: 'How to Use', Icon: GuideIcon },
  { id: 'updates', label: 'Updates', Icon: UpdatesIcon },
  { id: 'about', label: 'About', Icon: AboutIcon },
]

// Your name, dark mode, currency, and the two per-device stats preferences
// that used to only be reachable from inside Your Stats itself
// (statsPreferences.js — the default period and where Budgets sits on that
// page). Both still also work exactly as they did — the inline "Set ___ as
// default" link, and the link right in Your Stats' own Budgets section —
// this is just a second, more discoverable way to reach the same stored
// preference, not a replacement for either.
function ProfileSection() {
  const { user, displayName, setDisplayName } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { code, setCurrency } = useCurrency()

  const [nameDraft, setNameDraft] = useState(displayName)
  const [nameSaved, setNameSaved] = useState(false)
  const [nameError, setNameError] = useState(null)
  const [prefs, setPrefs] = useState(getStatsPreferences)

  async function saveDisplayName(e) {
    e.preventDefault()
    const trimmed = nameDraft.trim()
    if (!trimmed || trimmed === displayName) return
    setNameError(null)
    const { error } = await supabase.from('profiles').update({ display_name: trimmed }).eq('id', user.id)
    if (error) {
      setNameError(error.message)
      return
    }
    setDisplayName(trimmed)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 1500)
  }

  function updatePref(partial) {
    setPrefs(setStatsPreferences(partial))
  }

  return (
    <>
      <h2 className="settings-section-title">Your name</h2>
      <p className="muted">Shown to everyone in every group you're part of.</p>
      <form onSubmit={saveDisplayName} className="inline-form">
        <input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          placeholder="Your name"
          maxLength={80}
        />
        <button type="submit" className="btn-primary" disabled={!nameDraft.trim()}>
          {nameSaved ? 'Saved!' : 'Save'}
        </button>
      </form>
      {nameError && <p className="status-error">{nameError}</p>}

      <h2 className="settings-section-title">Appearance</h2>
      <div className="settings-row">
        <span>Dark mode</span>
        <label className="switch">
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} aria-label="Dark mode" />
          <span className="switch-slider" />
        </label>
      </div>

      <h2 className="settings-section-title">Currency</h2>
      <div className="settings-row">
        <span>Amounts shown as</span>
        <select value={code} onChange={(e) => setCurrency(e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code}
            </option>
          ))}
        </select>
      </div>

      <h2 className="settings-section-title">Stats</h2>
      <div className="settings-row">
        <span>Default period</span>
        <select
          value={prefs.defaultGranularity}
          onChange={(e) => updatePref({ defaultGranularity: e.target.value })}
        >
          {GRANULARITIES.map((g) => (
            <option key={g} value={g}>
              {granularityLabel(g)}
            </option>
          ))}
        </select>
      </div>
      <div className="settings-row">
        <span>Budgets position on Your Stats</span>
        <select
          value={prefs.thresholdsPosition}
          onChange={(e) => updatePref({ thresholdsPosition: e.target.value })}
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
        </select>
      </div>
    </>
  )
}

const CONTENT = {
  profile: ProfileSection,
  groups: SettingsGroupsSection,
  budgets: BudgetsSection,
  scan: ScanSettingsSection,
  guide: GuideSection,
  updates: SettingsUpdatesSection,
  about: AboutSection,
}

export default function Settings() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState('profile')
  const [expanded, setExpanded] = useState(false)
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const activeSection = SECTIONS.find((s) => s.id === activeId)
  const Content = CONTENT[activeId]

  async function doSignOut() {
    if (signingOut) return
    setSigningOut(true)
    await signOutAndClearCaches()
    // No navigate() here — the auth-state listener in AuthContext flips
    // `session` to null the moment this resolves, and RequireAuth (see
    // App.jsx) redirects to /login on its own the same way it does for any
    // other session loss.
  }

  return (
    <div className="page settings-page">
      <header className="page-header">
        <BackButton onClick={() => navigate(-1)} />
        <button
          type="button"
          className={`icon-btn${expanded ? ' active-toggle' : ''}`}
          onClick={() => setExpanded((e) => !e)}
          aria-label="Toggle menu"
          aria-expanded={expanded}
        >
          <MenuIcon size={19} />
        </button>
        <h1>{activeSection.label}</h1>
      </header>

      <div className={`settings-shell${expanded ? ' expanded' : ''}`}>
        <SettingsNav
          sections={SECTIONS}
          activeId={activeId}
          onSelect={setActiveId}
          onSignOut={() => setConfirmingSignOut(true)}
        />
        <div className="settings-content">
          <Content />
        </div>
      </div>

      {confirmingSignOut && (
        <ConfirmSheet
          title="Sign out of Spesa?"
          body="You'll need to sign back in to see your groups again."
          confirmLabel={signingOut ? 'Signing out…' : 'Sign out'}
          onConfirm={doSignOut}
          onCancel={() => !signingOut && setConfirmingSignOut(false)}
        />
      )}
    </div>
  )
}
