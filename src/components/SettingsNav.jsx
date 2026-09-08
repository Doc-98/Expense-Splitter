import { SignOutIcon } from './icons'

// The Settings page's own side nav — an icon-only rail by default
// (`expanded` false), showing labels once the header's hamburger button
// expands it (see Settings.jsx). Never fully disappears: even collapsed,
// every section stays one tap away rather than needing the rail reopened
// first, which is the point of it staying a rail instead of a drawer that
// closes over the content.
//
// Two different things can occupy the bottom, warm-colored slot below the
// spacer, and either or neither may be present:
// - `onSignOut` — a fire-once action (the account Settings page's Sign
//   Out), not a real section, so it never participates in active-
//   highlighting at all.
// - `dangerId` — the id of one of `sections` (Group Settings' own Danger
//   Zone) that should render down here instead of in the normal list
//   above. Unlike Sign Out this *is* a real section — clicking it just
//   calls `onSelect` like any other — so it still gets the active-state
//   treatment, just recolored to match (see .nav-item.danger in
//   styles.css).
export default function SettingsNav({ sections, activeId, onSelect, dangerId, onSignOut }) {
  const dangerSection = dangerId ? sections.find((s) => s.id === dangerId) : null
  const mainSections = dangerSection ? sections.filter((s) => s.id !== dangerId) : sections

  return (
    <nav className="settings-nav">
      {mainSections.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`nav-item${s.id === activeId ? ' active' : ''}`}
          onClick={() => onSelect(s.id)}
          title={s.label}
        >
          <s.Icon size={18} />
          <span className="label">{s.label}</span>
        </button>
      ))}
      <div className="nav-spacer" />
      {dangerSection && (
        <button
          type="button"
          className={`nav-item danger${dangerSection.id === activeId ? ' active' : ''}`}
          onClick={() => onSelect(dangerSection.id)}
          title={dangerSection.label}
        >
          <dangerSection.Icon size={18} />
          <span className="label">{dangerSection.label}</span>
        </button>
      )}
      {onSignOut && (
        <button type="button" className="nav-item signout" onClick={onSignOut} title="Sign Out">
          <SignOutIcon size={18} />
          <span className="label">Sign Out</span>
        </button>
      )}
    </nav>
  )
}
